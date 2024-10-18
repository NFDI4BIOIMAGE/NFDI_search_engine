import os
import yaml
import time
import datetime
import requests  
import pandas as pd
from pathlib import Path
from github import Github
from flask_cors import CORS
from flask import Flask, request, jsonify

app = Flask(__name__)
CORS(app)  # Enable CORS to allow requests from the React frontend

# GitHub raw URL for the latest version of nfdi4bioimage.yml
github_url = 'https://raw.githubusercontent.com/NFDI4BIOIMAGE/training/refs/heads/main/resources/nfdi4bioimage.yml'

def download_yaml_file():
    """
    Download the latest YAML file from GitHub.
    """
    try:
        response = requests.get(github_url)
        response.raise_for_status()  # Raise error if the download fails
        yaml_content = response.text
        app.logger.info("Downloaded the latest YAML file from GitHub")
        return yaml.safe_load(yaml_content)  # Parse YAML content
    except requests.exceptions.RequestException as e:
        app.logger.error(f"Error downloading the YAML file: {e}")
        return None

def all_content():
    """
    Load all YAML data from GitHub into a list of dictionaries.
    """
    try:
        resources = []
        yaml_data = download_yaml_file()  # Use the downloaded YAML file
        if yaml_data and 'resources' in yaml_data:
            resources.extend(yaml_data['resources'])
        else:
            app.logger.warning("No 'resources' key found in the YAML file.")
        app.logger.info(f"All content loaded: {resources}")
        return {'resources': resources}
    except Exception as e:
        app.logger.error(f"Error loading content from GitHub: {e}")
        return {'resources': []}  # Return empty list in case of error

@app.route('/api/get_unique_values', methods=['GET'])
def get_unique_values_from_yamls():
    """
    Get unique tags, types, and licenses from YAML files using pandas for data processing.
    """
    app.logger.info(f"Loading resources from GitHub")

    content = all_content()

    if not content['resources']:
        app.logger.warning("No resources found in the YAML files.")
        return jsonify({'tags': [], 'types': [], 'licenses': []})

    df = pd.DataFrame(content['resources'])

    # Handle cases where 'tags', 'type', and 'license' might not be present or not lists
    df['tags'] = df['tags'].apply(lambda x: x if isinstance(x, list) else [])
    df['type'] = df['type'].apply(lambda x: [x] if isinstance(x, str) else x if isinstance(x, list) else ['Unknown'])
    df['license'] = df['license'].apply(lambda x: [x] if isinstance(x, str) else x if isinstance(x, list) else [])

    # Extract unique values
    unique_tags = sorted(set(tag for sublist in df['tags'] for tag in sublist))
    unique_types = sorted(set(t for sublist in df['type'] for t in sublist))
    unique_licenses = sorted(set(l for sublist in df['license'] for l in sublist))

    app.logger.info(f"Unique Tags: {unique_tags}")
    app.logger.info(f"Unique Types: {unique_types}")
    app.logger.info(f"Unique Licenses: {unique_licenses}")

    return jsonify({
        'tags': unique_tags,
        'types': unique_types,
        'licenses': unique_licenses
    })

@app.route('/api/materials', methods=['GET'])
def get_materials():
    """
    Endpoint to fetch all materials.
    """
    app.logger.info(f"Loading materials from GitHub")
    
    content = all_content()
    
    if not content['resources']:
        app.logger.warning("No resources found in the YAML files.")
        return jsonify([])  # Return an empty list if no resources are found
    
    materials = content['resources']  # Assuming all materials are stored under 'resources' key
    
    return jsonify(materials)

def get_github_repository(repository):
    """
    Get the GitHub repository object.
    """
    access_token = os.getenv('GITHUB_API_KEY')
    
    if not access_token:
        raise Exception("GitHub API Key is not set in the environment variables.")

    g = Github(access_token)

    return g.get_repo(repository)

@app.route('/api/submit_material', methods=['POST'])
def submit_material():
    data = request.json
    authors = data.get('authors')
    license = data.get('license')
    name = data.get('name')
    description = data.get('description')
    num_downloads = data.get('num_downloads', '')
    publication_date = data.get('publication_date', '')
    tags = data.get('tags')
    type_ = data.get('type')
    url = data.get('url')

    if num_downloads and int(num_downloads) < 0:
        return jsonify({"error": "Number of downloads cannot be negative"}), 400
    
    # Set the yaml file as default
    yaml_file = 'nfdi4bioimage.yml'
    repo = get_github_repository("NFDI4BIOIMAGE/training")
    try:
        create_pull_request(repo, yaml_file, authors, license, name, description, num_downloads, publication_date, tags, type_, url)
        return jsonify({"message": "Pull request created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def create_pull_request(repo, yaml_file, authors, license, name, description, num_downloads, publication_date, tags, type_, url):
    try:
        file_path = f"resources/{yaml_file}"
        file_contents = repo.get_contents(file_path)
        yaml_content = file_contents.decoded_content.decode('utf-8')

        # Preserve original YAML content as is (no re-dumping)
        original_content_lines = yaml_content.splitlines()

        # Get the current date in yyyy-mm-dd format
        submit_date = datetime.datetime.now().strftime('%Y-%m-%d')

        # Properly format new entry with the specific order of fields
        new_entry = f"""
- authors: {authors}
  description: {description}
  license: {license if not isinstance(license, list) else license[0]}
  name: {name}
  num_downloads: {num_downloads}
  publication_date: {publication_date}
  tags: {tags if not isinstance(tags, list) else ', '.join(tags)}
  type: {type_ if not isinstance(type_, list) else ', '.join(type_)}
  submit_date: {submit_date}
  url: {url if not isinstance(url, list) else '\n  - ' + '\n  - '.join(url)}
"""
        
        # Append the new entry at the end of the file
        original_content_lines.append(new_entry.strip())

        # Combine everything back into the final content (no YAML dumping)
        new_yaml_content = "\n".join(original_content_lines)

        base_branch = repo.get_branch("main")
        timestamp = int(time.time())
        branch_name = f"update-{yaml_file.split('.')[0]}-{timestamp}".replace(' ', '-')
        repo.create_git_ref(ref=f"refs/heads/{branch_name}", sha=base_branch.commit.sha)
        repo.update_file(file_path, f"Add new entry", new_yaml_content, file_contents.sha, branch=branch_name)

        pr_title = f"Add new training materials request to {yaml_file}"
        pr_body = "Added new training materials."
        repo.create_pull(title=pr_title, body=pr_body, head=branch_name, base='main')

    except Exception as e:
        raise Exception(f"Failed to update YAML file and create pull request: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
