import whois
from datetime import datetime, timezone


def extract_domain_features(url: str) -> dict:
    features = {}

    try:
        import tldextract
        extracted = tldextract.extract(url)
        domain = f"{extracted.domain}.{extracted.suffix}"

        w = whois.whois(domain)

        def make_naive(dt):
            if dt is None:
                return None
            if hasattr(dt, 'tzinfo') and dt.tzinfo is not None:
                dt = dt.replace(tzinfo=None)
            return dt

        now = datetime.now()

        # Domain age in days
        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        creation_date = make_naive(creation_date)

        if creation_date:
            age_days = (now - creation_date).days
            features['domain_age_days'] = age_days
            features['domain_age_months'] = age_days // 30
        else:
            features['domain_age_days'] = -1
            features['domain_age_months'] = -1

        # Expiry date
        expiry_date = w.expiration_date
        if isinstance(expiry_date, list):
            expiry_date = expiry_date[0]
        expiry_date = make_naive(expiry_date)

        if expiry_date:
            days_to_expiry = (expiry_date - now).days
            features['days_to_expiry'] = days_to_expiry
        else:
            features['days_to_expiry'] = -1

        # Registrar info
        features['has_registrar'] = 1 if w.registrar else 0
        features['registrar'] = w.registrar if w.registrar else 'unknown'

        # Country
        features['has_country'] = 1 if w.country else 0

        # Updated date
        updated_date = w.updated_date
        if isinstance(updated_date, list):
            updated_date = updated_date[0]
        updated_date = make_naive(updated_date)

        if updated_date:
            features['days_since_update'] = (now - updated_date).days
        else:
            features['days_since_update'] = -1

    except Exception as e:
        print(f"  WHOIS lookup failed for {url}: {e}")
        features['domain_age_days'] = -1
        features['domain_age_months'] = -1
        features['days_to_expiry'] = -1
        features['has_registrar'] = 0
        features['registrar'] = 'unknown'
        features['has_country'] = 0
        features['days_since_update'] = -1

    return features


if __name__ == "__main__":
    test_urls = [
        "https://www.google.com",
        "https://www.amazon.com",
    ]

    for url in test_urls:
        print(f"\nURL: {url}")
        features = extract_domain_features(url)
        for key, value in features.items():
            print(f"  {key}: {value}")