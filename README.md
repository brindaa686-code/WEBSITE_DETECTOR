🛡️ AI-Powered Phishing Detection System

     An intelligent web security solution that detects phishing websites using Machine Learning. 
  Built with FastAPI, React, Scikit-learn, and a Chrome Extension.

 📖 Overview
       
       Phishing attacks continue to be one of the most prevalent cybersecurity threats, tricking users into revealing sensitive information through fraudulent websites.
This project presents an AI-powered phishing detection system capable of analyzing website URLs in real time and classifying them as **Legitimate** or **Phishing**. The system extracts multiple URL-based security features, processes them through a trained Machine Learning model, and returns prediction results with confidence scores and risk analysis.

The application consists of three major components:
- FastAPI Backend for prediction services
- React Frontend for user interaction
- Chrome Extension for real-time website verification

 
 ✨ Features
- Real-time phishing URL detection
- Machine Learning based prediction
- RESTful API using FastAPI
- Interactive React web interface
- Chrome browser extension
- URL feature extraction
- Risk level assessment
- Prediction confidence score
- Modular and scalable architecture
- Easy deployment and maintenance


 🏛 System Architecture


                   User
                     │
                     ▼
            React Web Application
                     │
                     ▼
              FastAPI REST API
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
 Feature Extraction      Machine Learning Model
         │                       │
         └───────────┬───────────┘
                     ▼
             Prediction Response
                     │
                     ▼
          Browser / Chrome Extension




🧠 Machine Learning Pipeline


Dataset
   │
   ▼
Data Cleaning
   │
   ▼
Feature Engineering
   │
   ▼
Model Training
   │
   ▼
Model Evaluation
   │
   ▼
Model Serialization
   │
   ▼
FastAPI Prediction API
   │
   ▼
React Frontend & Chrome Extension



 📂 Project Structure


phishing_detector/
│
├── data/                     # Dataset
├── extension/                # Chrome Extension
├── frontend/                 # React Application
├── models/                   # Trained ML Models
├── notebooks/                # Jupyter Notebooks
├── src/
│   ├── api/                  # FastAPI APIs
│   ├── features/             # Feature Extraction
│   ├── model/                # Model Training & Prediction
│   └── utils/                # Helper Functions
│
├── tests/
├── requirements.txt
└── README.md



 ⚙️ Technology Stack

| Category | Technology |
|-----------|------------|
| Programming Language | Python 3 |
| Backend | FastAPI |
| Frontend | React + Vite |
| Machine Learning | Scikit-learn |
| Data Processing | Pandas, NumPy |
| Browser Extension | Chrome Extension (Manifest V3) |
| API Testing | Swagger UI |
| Model Storage | Joblib |


 🔍 URL Features

The prediction model evaluates several security-related URL characteristics, including:

- URL Length
- HTTPS Usage
- Number of Dots
- Number of Hyphens
- Number of Digits
- Presence of IP Address
- Special Characters
- Suspicious Keywords
- Domain Information
- SSL Certificate Details


 🚀 Installation

 Clone Repository


git clone https://github.com/yourusername/phishing_detector.git

cd phishing_detector


## Create Virtual Environment
Windows

python -m venv venv

venv\Scripts\activate

 

## Install Dependencies

pip install -r requirements.txt


 ▶ Running the Backend

uvicorn src.api.main:app --reload


Backend URL

http://localhost:8000


Swagger Documentation

http://localhost:8000/docs


 ▶ Running the Frontend


cd frontend

npm install

npm run dev


Frontend URL

http://localhost:5173



 🌐 Chrome Extension

1. Open Chrome.
2. Navigate to chrome://extensions.
3. Enable Developer Mode.
4. Click Load Unpacked.
5. Select the extension/ folder.
6. Ensure the FastAPI backend is running.


 📡 REST API

 Health Check

http
GET /health

Response
json
{
  "status": "healthy"
}


 Predict URL

http
POST /predict


Request
json
{
    "url":"https://example.com"
}


Response
json
{
    "prediction":"Legitimate",
    "confidence":98.74,
    "risk":"Low"
}


📊 Workflow

User Input URL
        │
        ▼
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
Feature Extraction
        │
        ▼
Machine Learning Model
        │
        ▼
Prediction & Risk Analysis
        │
        ▼
Result Display



📈 Future Enhancements

- Deep Learning based detection
- Email phishing detection
- SMS phishing detection
- QR code scanning
- WHOIS analysis
- SSL certificate validation
- Threat Intelligence API integration
- User authentication
- Docker deployment
- Kubernetes support
- Cloud deployment (AWS, Azure, GCP)




- FastAPI
- React
- Scikit-learn
- Pandas
- NumPy
- Chrome Extensions API
- Open Source Community
