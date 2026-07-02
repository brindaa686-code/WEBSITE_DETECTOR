import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (classification_report,
                             confusion_matrix,
                             accuracy_score)
import xgboost as xgb
import joblib
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))

from features.url_features import extract_url_features


def load_sample_data():
    phishing_urls = [
        "http://paypa1-secure.tk/login/verify?account=update",
        "http://paypa1-secure.tk/login",
        "http://paypa1.tk/login",
        "http://secure-paypal.tk/verify",
        "http://login-paypa1.tk/account",
        "http://paypal-secure-login.tk/verify",
        "http://192.168.1.1/login.php",
        "http://192.168.0.1/admin/login",
        "http://10.0.0.1/login.php",
        "http://172.16.0.1/verify",
        "http://amazon-secure-login.suspicious.com/verify",
        "http://amazon-order-alert.tk/login",
        "http://amazon-gift-card-winner.com/claim",
        "http://www.paypal.com.phishing.com/login",
        "http://secure-banking-update.tk/account/verify",
        "http://apple-id-locked.com/signin/verify",
        "http://secure-apple-id.tk/signin",
        "http://apple-locked-account.com/verify",
        "http://microsoft-account-alert.com/update",
        "http://microsoft-alert-security.tk/update",
        "http://ebay.com.login-secure.tk/signin",
        "http://verify-your-account-now.com/bank/login",
        "http://secure.paypal.com.attacker.com/login",
        "http://login-facebook-secure.tk/account",
        "http://facebook-login-secure.tk/account",
        "http://update-your-netflix-billing.com/login",
        "http://netflix-billing-update.tk/account",
        "http://icloud-account-suspended.com/verify",
        "http://gmail-security-alert.suspicious.tk/login",
        "http://google-account-verify.tk/signin",
        "http://bank-of-america-secure.tk/signin",
        "http://wells-fargo-alert.com.phish.tk/update",
        "http://wells-fargo-verify.tk/account",
        "http://chase-bank-verification.tk/account",
        "http://chase-alert-security.com/login",
        "http://secure-dropbox-login.com.tk/signin",
        "http://citibank-secure.tk/signin",
        "http://update-billing-info.tk/payment",
        "http://bank-secure-login.tk/verify",
        "http://secure.google.com.attacker.tk/verify",
    ]

    legitimate_urls = [
        "https://www.google.com",
        "https://www.amazon.com",
        "https://www.microsoft.com",
        "https://www.apple.com",
        "https://www.facebook.com",
        "https://www.twitter.com",
        "https://www.linkedin.com",
        "https://www.github.com",
        "https://www.stackoverflow.com",
        "https://www.wikipedia.org",
        "https://www.youtube.com",
        "https://www.netflix.com",
        "https://www.instagram.com",
        "https://www.reddit.com",
        "https://www.dropbox.com",
        "https://www.spotify.com",
        "https://www.paypal.com",
        "https://www.ebay.com",
        "https://www.adobe.com",
        "https://www.salesforce.com",
        "https://www.zoom.us",
        "https://www.slack.com",
        "https://www.notion.so",
        "https://www.figma.com",
        "https://www.canva.com",
        "https://www.trello.com",
        "https://www.atlassian.com",
        "https://www.shopify.com",
        "https://www.stripe.com",
        "https://www.twilio.com",
        "https://www.cloudflare.com",
        "https://www.digitalocean.com",
        "https://www.heroku.com",
        "https://www.vercel.com",
        "https://www.netlify.com",
        "https://www.mongodb.com",
        "https://www.postgresql.org",
        "https://www.mysql.com",
        "https://www.oracle.com",
        "https://www.ibm.com",
    ]

    data = []

    print("Extracting features from phishing URLs...")
    for url in phishing_urls:
        features = extract_url_features(url)
        features['label'] = 1
        features['url'] = url
        data.append(features)

    print("Extracting features from legitimate URLs...")
    for url in legitimate_urls:
        features = extract_url_features(url)
        features['label'] = 0
        features['url'] = url
        data.append(features)

    return pd.DataFrame(data)


def train_model():
    print("=" * 50)
    print("PHISHING DETECTOR - MODEL TRAINING")
    print("=" * 50)

    # Load data
    print("\n1. Loading and extracting features...")
    df = load_sample_data()
    print(f"   Total samples: {len(df)}")
    print(f"   Phishing: {df['label'].sum()}")
    print(f"   Legitimate: {len(df) - df['label'].sum()}")

    # Prepare features
    print("\n2. Preparing features...")
    feature_cols = [col for col in df.columns
                    if col not in ['label', 'url']]
    X = df[feature_cols]
    y = df['label']
    print(f"   Number of features: {len(feature_cols)}")

    # Split data
    print("\n3. Splitting data...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y)
    print(f"   Training samples: {len(X_train)}")
    print(f"   Testing samples: {len(X_test)}")

    # Train model
    print("\n4. Training XGBoost model...")
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X_train, y_train)
    print("   Model trained successfully!")

    # Evaluate
    print("\n5. Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n   Accuracy: {accuracy * 100:.2f}%")
    print(f"\n   Classification Report:")
    print(classification_report(y_test, y_pred,
          target_names=['Legitimate', 'Phishing']))
    print(f"   Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Save model
    print("\n6. Saving model...")
    os.makedirs('models', exist_ok=True)
    model_path = 'models/phishing_model.pkl'
    feature_path = 'models/feature_columns.pkl'
    joblib.dump(model, model_path)
    joblib.dump(feature_cols, feature_path)
    print(f"   Model saved to: {model_path}")
    print(f"   Features saved to: {feature_path}")

    print("\n" + "=" * 50)
    print("TRAINING COMPLETE!")
    print("=" * 50)

    return model, feature_cols


if __name__ == "__main__":
    train_model()