from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import requests
import yaml
from elasticsearch import Elasticsearch, ConnectionError
import time

# Initializing Flask app and enabling CORS
app = Flask(__name__)
CORS(app)

# Set up logging to provide useful information and error messages
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to connect to Elasticsearch with multiple retry attempts
def connect_elasticsearch():
    """
    Attempts to connect to Elasticsearch. Retries up to a specified number of attempts if connection fails.

    Returns:
        Elasticsearch: Connected Elasticsearch instance, or raises an Exception after several failed attempts.
    """
    es = None
    max_attempts = 60  # Number of attempts to try connecting to Elasticsearch
    for attempt in range(max_attempts):
        try:
            es = Elasticsearch(
                [{'host': 'elasticsearch', 'port': 9200, 'scheme': 'http'}],
                timeout=30  # Extended timeout for requests
            )
            if es.ping():
                logger.info("Connected to Elasticsearch")
                return es
            else:
                logger.error("Elasticsearch ping failed")
        except ConnectionError:
            logger.error(f"Elasticsearch not ready, attempt {attempt+1}/{max_attempts}, retrying in 10 seconds...")
            time.sleep(10)  # Delay between retry attempts
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            time.sleep(10)
    raise Exception("Could not connect to Elasticsearch after several attempts")

# Connect to Elasticsearch and handle errors if unable to connect
es = connect_elasticsearch()

# URL for fetching the latest YAML file with bioimage training resources from GitHub
github_url = 'https://raw.githubusercontent.com/NFDI4BIOIMAGE/training/refs/heads/main/resources/nfdi4bioimage.yml'

# Function to download and parse YAML data from the specified GitHub URL
def download_yaml_file():
    """
    Downloads the YAML file from GitHub and parses it.

    Returns:
        dict: Parsed YAML content if successful, otherwise None.
    """
    try:
        response = requests.get(github_url)
        response.raise_for_status()
        yaml_content = response.text
        logger.info("Downloaded the latest YAML file from GitHub")
        return yaml.safe_load(yaml_content)
    except requests.exceptions.RequestException as e:
        logger.error(f"Error downloading the YAML file: {e}")
        return None

# Function to delete the Elasticsearch index if it exists
def delete_index(index_name):
    """
    Deletes an existing Elasticsearch index.

    Args:
        index_name (str): The name of the Elasticsearch index to delete.
    """
    try:
        es.indices.delete(index=index_name, ignore=[400, 404])
        logger.info(f"Deleted existing index: {index_name}")
    except Exception as e:
        logger.error(f"Error deleting index {index_name}: {e}")

# Function to index resources from the downloaded YAML file into Elasticsearch
def index_yaml_files():
    """
    Downloads the latest YAML data and indexes its content into Elasticsearch for search functionality.
    """
    try:
        yaml_content = download_yaml_file()
        if yaml_content is None:
            raise Exception("Failed to download the YAML file from GitHub")

        # Set up index mapping with search-as-you-type enabled for specific fields
        mapping = {
            "mappings": {
                "properties": {
                    "name": {"type": "search_as_you_type"},
                    "description": {"type": "search_as_you_type"},
                    "tags": {"type": "text"},
                    "authors": {"type": "text"},
                    "type": {"type": "text"},
                    "license": {"type": "text"},
                    "url": {"type": "text"}
                }
            }
        }

        # Create the Elasticsearch index with the specified mapping
        es.indices.create(index='bioimage-training', body=mapping, ignore=400)

        # Index each resource item from the 'resources' section of the YAML file
        data = yaml_content.get('resources', [])
        if isinstance(data, list):
            for item in data:
                try:
                    if isinstance(item, dict):
                        es.index(index='bioimage-training', body=item)
                        logger.info(f"Indexed item: {item}")
                    else:
                        logger.error(f"Item is not a dictionary: {item}")
                except Exception as e:
                    logger.error(f"Error indexing item: {item} - {e}")
        else:
            logger.error(f"Data is not a list: {data}")

        # Refresh the index to make indexed documents searchable
        es.indices.refresh(index='bioimage-training')

    except Exception as e:
        logger.error(f"Error indexing YAML files: {e}")

# Route for fetching all materials using Elasticsearch's Scroll API
@app.route('/api/materials', methods=['GET'])
def get_materials():
    """
    Fetches all indexed materials from Elasticsearch and returns them in a paginated format.

    Returns:
        JSON response with materials or error message.
    """
    try:
        materials = []
        scroll_time = '2m'
        scroll_size = 1000

        # Initiate a scroll to retrieve data in batches
        response = es.search(
            index='bioimage-training',
            scroll=scroll_time,
            size=scroll_size,
            body={"query": {"match_all": {}}}
        )

        scroll_id = response['_scroll_id']
        materials += [doc['_source'] for doc in response['hits']['hits']]

        # Continue scrolling until all data is retrieved
        while len(response['hits']['hits']) > 0:
            response = es.scroll(scroll_id=scroll_id, scroll=scroll_time)
            scroll_id = response['_scroll_id']
            materials += [doc['_source'] for doc in response['hits']['hits']]

        return jsonify(materials)

    except Exception as e:
        logger.error(f"Error fetching data from Elasticsearch: {e}")
        return jsonify({"error": str(e)}), 500

# Route for search functionality in Elasticsearch with optional exact match
@app.route('/api/search', methods=['GET'])
def search():
    """
    Searches indexed materials in Elasticsearch based on user query. Supports exact matches on 'name' field.

    Returns:
        JSON response with search results or error message.
    """
    query = request.args.get('q', '')
    exact_match = request.args.get('exact_match', 'false').lower() == 'true'
    sanitized_query = query.replace('+', ' ').replace(':', '')

    try:
        if exact_match:
            es_response = es.search(
                index='bioimage-training',
                body={
                    "query": {
                        "match_phrase": {"name": sanitized_query}
                    }
                },
                size=1000
            )
        else:
            es_response = es.search(
                index='bioimage-training',
                body={
                    "query": {
                        "multi_match": {
                            "query": sanitized_query,
                            "fields": ["name^3", "description", "tags", "authors", "type", "license"],
                            "type": "best_fields"
                        }
                    }
                },
                size=1000
            )
        return jsonify(es_response['hits']['hits'])
    except Exception as e:
        logger.error(f"Error searching in Elasticsearch: {e}")
        return jsonify({"error": str(e)}), 500

# Route for providing search suggestions based on partial query
@app.route('/api/suggest', methods=['GET'])
def suggest():
    """
    Provides search suggestions for auto-complete functionality based on partial user query.

    Returns:
        JSON response with suggested matches or error message.
    """
    try:
        query = request.args.get('q', '')
        es_response = es.search(
            index='bioimage-training',
            body={
                "query": {
                    "multi_match": {
                        "query": query,
                        "fields": ["name", "description"],
                        "type": "bool_prefix"
                    }
                }
            }
        )
        suggestions = es_response['hits']['hits']
        return jsonify([suggestion['_source'] for suggestion in suggestions])
    except Exception as e:
        logger.error(f"Error fetching suggestions from Elasticsearch: {e}")
        return jsonify({"error": str(e)}), 500

# Main entry point to optionally delete the index, reindex data, and run the Flask app
if __name__ == '__main__':
    delete_index('bioimage-training')
    index_yaml_files()
    app.run(host='0.0.0.0', port=5000, debug=True)
