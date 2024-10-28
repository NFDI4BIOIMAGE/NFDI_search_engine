import requests
import yaml
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import os

# URL to fetch the YAML file
GITHUB_YAML_URL = 'https://raw.githubusercontent.com/NFDI4BIOIMAGE/training/refs/heads/main/resources/nfdi4bioimage.yml'

def fetch_yaml_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        yaml_content = yaml.safe_load(response.text)
        return yaml_content.get('resources', [])
    except requests.exceptions.RequestException as e:
        print(f"Failed to fetch YAML data: {e}")
        return []

def collect_tags(data):
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
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate_from_frequencies(tag_counts)
    wordcloud_path = 'static/wordcloud.png'
    if not os.path.exists('static'):
        os.makedirs('static')
    wordcloud.to_file(wordcloud_path)
    print(f"Word cloud saved to {wordcloud_path}")

def main():
    data = fetch_yaml_data(GITHUB_YAML_URL)
    tag_counts = collect_tags(data)
    generate_word_cloud(tag_counts)

if __name__ == '__main__':
    main()
