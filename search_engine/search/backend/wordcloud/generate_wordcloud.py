import requests
import yaml
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import os

# URL to fetch the YAML file containing resources with associated tags
GITHUB_YAML_URL = 'https://raw.githubusercontent.com/NFDI4BIOIMAGE/training/refs/heads/main/resources/nfdi4bioimage.yml'

def fetch_yaml_data(url):
    """
    Fetches data from the specified YAML URL and parses it.
    If successful, returns a list of resources; otherwise, an empty list.

    Args:
        url (str): The URL pointing to the YAML file.

    Returns:
        list: A list of resource entries from the YAML file or an empty list if fetching fails.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()
        yaml_content = yaml.safe_load(response.text)
        return yaml_content.get('resources', [])
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch YAML data: {e}")
        return []

def collect_tags(data):
    """
    Aggregates tag occurrences across resources.

    Args:
        data (list): A list of resource entries, each with associated tags.

    Returns:
        dict: A dictionary where keys are tags, and values are their respective counts.
    """
    tag_counts = {}
    for item in data:
        tags = item.get('tags', [])
        for tag in tags:
            if tag in tag_counts:
                tag_counts[tag] += 1
            else:
                tag_counts[tag] = 1
    return tag_counts

def generate_word_cloud(tag_counts):
    """
    Generates a word cloud image from tag frequencies and saves it locally.

    Args:
        tag_counts (dict): A dictionary of tags and their corresponding frequencies.

    Saves:
        A word cloud image to 'static/wordcloud.png'.
    """
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate_from_frequencies(tag_counts)
    wordcloud_path = 'static/wordcloud.png'
    if not os.path.exists('static'):
        os.makedirs('static')
    wordcloud.to_file(wordcloud_path)
    print(f"Word cloud saved to {wordcloud_path}")

def main():
    """
    Main execution function. Fetches YAML data, collects tag frequencies, and generates a word cloud.
    """
    data = fetch_yaml_data(GITHUB_YAML_URL)
    tag_counts = collect_tags(data)
    generate_word_cloud(tag_counts)

if __name__ == '__main__':
    main()
