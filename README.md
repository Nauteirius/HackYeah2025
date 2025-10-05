# Disinformation Control 🛡️

A comprehensive solution to identify and combat disinformation across digital platforms.

## 📺 Main Demo
![Main demo](docs/main_demo.gif)

## 📋 Project Overview

This project is divided into three main components:

- **Frontend**: User interface for interaction with the system
- **Backend**: API and processing logic
- **Chrome Extension**: Browser-based detection tool

## 🚀 Getting Started

Follow these instructions to set up and run each component of the project.

### Frontend

```bash
# Checkout to the frontend branch
git checkout feature/frontend

# Install dependencies
npm i

# Start development server
npm run dev
```

### Chrome Extension

```bash
# Checkout to the frontend branch
git checkout feature/frontend

# Installation
1. Open Chrome and navigate to chrome://extensions/
2. Enable "Developer mode" in the top-right corner
3. Click "Load unpacked" and select the ./extension directory
```

### Backend

```bash
# Prerequisite: Prepare your OpenAI API key

# Checkout to main branch
git checkout main

# Build the Docker container
# Replace <container_name> with your preferred name
docker build -t <container_name> .

# Run the container
docker run -e API_KEY="hackyeah-haey" \
           -e OPENAI_API_KEY="YOUR_OPENAI_API_KEY" \
           -d \
           --name <container_name> \
           -p 8000:80 \
           <container_name>:latest

# Optional: To use a custom database, replace the connection string in auth/db.py
```

## 💻 Technology Stack

- **Frontend**: React/Next.js
- **Backend**: Python, FastAPI, MongoDB
- **Extension**: Chrome Extensions API
- **AI Processing**: OpenAI API


## 📺 News Demo
![News demo](docs/news_demo.gif)
