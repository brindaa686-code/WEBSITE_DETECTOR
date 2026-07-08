# Backend — FastAPI + scikit-learn

The brain of the project: a REST API that extracts features from a URL and runs them through a trained Random Forest model.

## Folder map

```
backend/
├── models/                     # trained model files (committed, works out of the box)
│   ├── phishing_model.pkl
│   └── feature_columns.pkl
├── src/
│   ├── api/main.py             # FastAPI app — the /predict and /health endpoints
│   ├── features/
│   │   ├── url_features.py     # turns a URL string into ~25 numeric features (used by the model)
│   │   ├── domain_features.py  # WHOIS features (written, not wired into the model yet)
│   │   └── ssl_features.py     # SSL certificate features (written, not wired in yet)
│   └── model/
│       ├── train.py            # trains the model and saves it to models/
│       └── predict.py          # loads the model and makes predictions
├── tests/                      # pytest tests
├── requirements.txt
└── pytest.ini
```

## Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

## Run the API

```bash
uvicorn src.api.main:app --reload
```

- API: http://127.0.0.1:8000
- Interactive docs (Swagger): http://127.0.0.1:8000/docs

> **Note:** always run commands from the `backend/` folder so the `src` package can be found.

## Retrain the model

```bash
python -m src.model.train
```

This extracts features from the sample URLs in `train.py`, trains a Random Forest classifier, prints the accuracy report, and saves the model to `models/`. To improve it, replace the sample URL lists in `load_sample_data()` with a real dataset.

## Try predictions from the terminal

```bash
python -m src.model.predict
```

## Run tests

```bash
python -m pytest
```
