# NFDI Search Engine

This repository is dedicated to enhancing the search functionality of the NFDI4BioImage training website by collecting and organizing training materials and related resources.

## Overview

The project leverages several key technologies:

- **[Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)**: For indexing and searching materials.
- **[React](https://react.dev/learn)**: As the frontend framework for building a user-friendly interface.
- **[Flask](https://flask.palletsprojects.com/en/latest/)**: Serving as the backend API to manage interactions with the database and Elasticsearch.
- **[Scroll API](https://www.elastic.co/guide/en/elasticsearch/reference/current/scroll-api.html)**: Used to efficiently handle large datasets during search queries.


## Quick Start with Docker

To simplify the setup process, the project is containerized with Docker. Follow these steps to get the search engine up and running on your local machine.

Here’s the revised **Prerequisites** section with the **KISSKI API Key** setup instructions included:

---

### Prerequisites

1. **GitHub API Key or Token**: The search engine requires access to GitHub for submitting and managing materials. Ensure that you have set up the necessary GitHub API keys or tokens on your machine.  
   - You can refer to this [website](https://nfdi4bioimage.github.io/training/contributing/submit_app.html) for instructions on how to set up the API key or token.  
   - This key/token should be securely stored and added to the necessary environment variables on your machine.

2. **KISSKI API Key**: To enable the NFDIBIOIMAGE Assistant to interact with the KISSKI LLM service, you need to configure your KISSKI API key. Follow these steps to set it up:

   #### Step 1: Obtain a KISSKI API Key
   1. Visit the official KISSKI LLM service page: [KISSKI LLM Service](https://services.kisski.de/services/en/?service=2-02-llm-service.json).
   2. Register or log in to access the service.
   3. Once registered, generate your **KISSKI API key** from the email.

   #### Step 2: Set Up the API Key in the Project
   1. Open the project directory in your preferred code editor.
   2. Locate the `.env` file in the root of the project. If the file doesn't exist, create a new one.
   3. Add the following line to your `.env` file:
      ```plaintext
      KISSKI_API_KEY=your_kisski_api_key_here
      ```
      Replace `your_kisski_api_key_here` with the API key you obtained from KISSKI.

   4. Save the `.env` file.

3. **[Docker](https://www.docker.com/)** and **[Docker Compose](https://docs.docker.com/compose/install/)** installed on your machine.

4. **Currently, this project is only supported on Windows.**

---

Let me know if you need further refinements!






### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/NFDI4BIOIMAGE/nfdi_search_engine.git
   ```
   ```bash
   cd nfdi_search_engine
   ```

2. Locate the `docker-compose.yml` file in the project directory.

3. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

This command will pull all necessary images, build the project, and start the containers.

4. **Important**: After the initial setup, when you start the containers again by clicking the **Start** button in Docker Desktop, you will need to wait approximately **22 seconds** for Elasticsearch to fully initialize before the search engine becomes accessible.


## Accessing the Application

Once the Docker containers are running, you can access the application:

1. **Search Engine Interface**: Visit 'http://localhost:3000' to access the search engine. You’ll find a user-friendly interface that allows you to search and browse a variety of training materials related to bioimage analysis.

  ![Search Engine](./images/search_engine.png)

  ![Search Engine Results](./images/search_results.png)

2. **Real-Time Search Suggestions**: As you type in the search bar, real-time search suggestions will appear, helping you quickly locate relevant materials. The suggestions provide specific document titles based on your query, making it easier to find exactly what you need.

  ![Search Engine Suggestion](./images/search_engine_2.png)

3. **View All Training Materials**: Explore all available training materials in the Materials section, where resources are displayed in a paginated, organized format. Use the filters on the left to sort materials by Authors, Tags, Types, and Licenses to refine your search results further.

  ![Materials](./images/materials.png)

4. **Submit Materials**: Contribute to the platform by submitting new training materials through the Submit Materials page. Navigate to 'http://localhost:3000/' submit-materials and complete the form to add your content. Fields marked with * are required, while fields labeled as "Optional" can be filled in at your discretion.

  ![Submit Materials](./images/submit_materials.png)


## Features

- **Search Engine**: Find all the current training materials available on the NFDI4BioImage training website with easy-to-use search functionality.
  

- **Material Submission**: A streamlined process for collecting and managing training materials via the submission portal.



To enhance your README and provide comprehensive documentation for the chatbot assistant, you could add a dedicated section for it. Here's a suggestion for how you can structure the content:

---

## NFDIBIOIMAGE Assistant: Your Chatbot Helper

The **NFDIBIOIMAGE Assistant** is an intelligent chatbot integrated into the search engine to assist users in finding relevant materials and answering questions about the platform. This chatbot leverages **KISSKI's LLM service** and Elasticsearch to provide quick and accurate responses.

### Features of the Chatbot:
- **Context-Aware Assistance**: The chatbot retrieves and displays relevant documents based on your query, making it easier to explore related training materials.
- **Real-Time Responses**: Powered by a large language model, the chatbot generates detailed yet concise answers in seconds.
- **Embedded Links**: Responses include direct links to relevant materials for quick access.
- **User-Friendly Interface**: The chatbot interface is minimal and intuitive, with features like auto-scrolling, "typing" indicators, and message highlighting.

### How It Works:
1. **Query Submission**: Users type their queries into the chatbot widget on the homepage.
2. **Document Retrieval**: The chatbot fetches top documents from the Elasticsearch index.
3. **Response Generation**: Based on the retrieved context, the chatbot generates a response using the KISSKI language model.
4. **Interactive Chat**: Users can refine their queries and engage in a continuous, interactive chat.

### Technologies Behind the Assistant:
- **Flask**: Backend framework to handle API requests.
- **Elasticsearch**: Used for document retrieval and indexing.
- **KISSKI LLM**: Language model for generating responses.
- **React**: Frontend framework for rendering the chatbot widget.
- **Axios**: For asynchronous communication between frontend and backend.

### Example Interaction:
![NFDIBIOIMAGE Assistant Chat Example](./images/nfdibioimage_assistant.png)

### How to Use the Chatbot:
1. Click the floating chatbot icon at the bottom-right corner of the homepage.
2. Type your question or keyword in the chat box.
3. Receive instant suggestions and relevant material links.
4. Click on links to access detailed information.

### Code for the Chatbot:
The chatbot consists of three key components:
1. **Backend (`chatbot.py`)**: Manages query handling, document retrieval, and response generation.
2. **LLM Utilities (`llm_utilities.py`)**: Interfaces with KISSKI's LLM API for natural language understanding.
3. **Frontend (`ChatbotWidget.js`)**: Provides the user interface for interacting with the chatbot.




## Contributing

If you'd like to contribute to the project, feel free to open an issue or submit a pull request.



