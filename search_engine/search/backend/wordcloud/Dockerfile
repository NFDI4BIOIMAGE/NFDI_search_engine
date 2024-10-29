# Use the official Python image as a base
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements_wordcloud.txt .

# Install the dependencies
RUN pip install --upgrade pip && pip install -r requirements_wordcloud.txt

# Copy the rest of the application code into the container
COPY . .

# Run the word cloud generator script
CMD ["python", "generate_wordcloud.py"]
