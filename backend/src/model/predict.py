import joblib
import os
import sys
import numpy as np
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))

from features.url_features import extract_url_features


def load_model():
    model_path = 'models/phishing_model.pkl'
    feature_path = 'models/feature_columns.pkl'

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            "Model not found. Run train.py first.")

    model = joblib.load(model_path)
    feature_cols = joblib.load(feature_path)
    return model, feature_cols


def predict_url(url: str) -> dict:
    try:
        # Load model
        model, feature_cols = load_model()

        # Extract features
        features = extract_url_features(url)

        # Convert to dataframe
        df = pd.DataFrame([features])

        # Make sure all columns are present
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0

        # Keep only model features in correct order
        df = df[feature_cols]

        # Predict
        prediction = model.predict(df)[0]
        probability = model.predict_proba(df)[0]

        phishing_prob = float(probability[1])
        legitimate_prob = float(probability[0])

        # Risk level
        if phishing_prob >= 0.8:
            risk_level = "HIGH RISK"
        elif phishing_prob >= 0.5:
            risk_level = "MEDIUM RISK"
        else:
            risk_level = "SAFE"

        # Top warning signs
        warning_signs = []
        if features.get('has_https') == 0:
            warning_signs.append("No HTTPS encryption")
        if features.get('has_ip_address') == 1:
            warning_signs.append("Uses IP address instead of domain")
        if features.get('has_prefix_suffix') == 1:
            warning_signs.append("Hyphens in domain name")
        if features.get('num_suspicious_keywords', 0) > 2:
            warning_signs.append("Multiple suspicious keywords")
        if features.get('has_subdomain') == 1 and \
                features.get('subdomain_length', 0) > 10:
            warning_signs.append("Unusually long subdomain")
        if features.get('url_length', 0) > 75:
            warning_signs.append("URL is very long")
        if features.get('num_hyphens', 0) > 2:
            warning_signs.append("Too many hyphens in URL")

        return {
            'url': url,
            'prediction': 'PHISHING' if prediction == 1
                          else 'LEGITIMATE',
            'risk_level': risk_level,
            'phishing_probability': round(phishing_prob * 100, 2),
            'legitimate_probability': round(legitimate_prob * 100, 2),
            'warning_signs': warning_signs,
            'features': features
        }

    except Exception as e:
        return {
            'url': url,
            'prediction': 'ERROR',
            'risk_level': 'UNKNOWN',
            'phishing_probability': 0,
            'legitimate_probability': 0,
            'warning_signs': [],
            'error': str(e)
        }


if __name__ == "__main__":
    test_urls = [
        "https://www.google.com",
        "http://paypa1-secure.tk/login/verify?account=update",
        "http://192.168.1.1/login.php",
        "https://amazon-secure-login.suspicious.com/verify",
        "https://www.github.com",
        "http://verify-your-account-now.com/bank/login",
    ]

    print("=" * 60)
    print("PHISHING DETECTOR - PREDICTIONS")
    print("=" * 60)

    for url in test_urls:
        result = predict_url(url)
        print(f"\nURL: {result['url']}")
        print(f"  Prediction:   {result['prediction']}")
        print(f"  Risk Level:   {result['risk_level']}")
        print(f"  Phishing:     {result['phishing_probability']}%")
        print(f"  Legitimate:   {result['legitimate_probability']}%")
        if result['warning_signs']:
            print(f"  Warnings:")
            for w in result['warning_signs']:
                print(f"    ⚠ {w}")
        print("-" * 60)