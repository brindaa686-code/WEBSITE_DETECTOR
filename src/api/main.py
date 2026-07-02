from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))

from model.predict import predict_url

app = FastAPI(
    title="Phishing Detector API",
    description="Detects phishing URLs using ML",
    version="1.0.0"
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class URLRequest(BaseModel):
    url: str


class PredictionResponse(BaseModel):
    url: str
    prediction: str
    risk_level: str
    phishing_probability: float
    legitimate_probability: float
    warning_signs: list
    features: dict


@app.get("/")
def root():
    return {
        "message": "Phishing Detector API is running!",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/predict")
def predict(request: URLRequest):
    if not request.url:
        raise HTTPException(
            status_code=400,
            detail="URL cannot be empty"
        )

    if not request.url.startswith(('http://', 'https://')):
        raise HTTPException(
            status_code=400,
            detail="URL must start with http:// or https://"
        )

    result = predict_url(request.url)

    if result.get('prediction') == 'ERROR':
        raise HTTPException(
            status_code=500,
            detail=result.get('error', 'Prediction failed')
        )

    return result


@app.get("/predict")
def predict_get(url: str):
    if not url:
        raise HTTPException(
            status_code=400,
            detail="URL parameter is required"
        )

    result = predict_url(url)
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)