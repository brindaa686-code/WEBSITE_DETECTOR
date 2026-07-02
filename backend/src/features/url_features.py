import re
from urllib.parse import urlparse
import tldextract

def extract_url_features(url: str) -> dict:
    features = {}

    # Basic URL properties
    features['url_length'] = len(url)
    features['has_https'] = 1 if url.startswith('https') else 0

    # Parse the URL
    parsed = urlparse(url)
    extracted = tldextract.extract(url)

    hostname = parsed.netloc
    path = parsed.path

    # Domain based
    features['domain_length'] = len(extracted.domain)
    features['subdomain_length'] = len(extracted.subdomain)
    features['has_subdomain'] = 1 if extracted.subdomain else 0
    features['tld_length'] = len(extracted.suffix)

    # Suspicious character counts
    features['num_dots'] = url.count('.')
    features['num_hyphens'] = url.count('-')
    features['num_underscores'] = url.count('_')
    features['num_slashes'] = url.count('/')
    features['num_at'] = url.count('@')
    features['num_question'] = url.count('?')
    features['num_equals'] = url.count('=')
    features['num_ampersand'] = url.count('&')
    features['num_percent'] = url.count('%')
    features['num_digits'] = sum(c.isdigit() for c in url)

    # Suspicious patterns
    features['has_ip_address'] = 1 if re.match(
        r'http[s]?://\d+\.\d+\.\d+\.\d+', url) else 0
    features['has_at_symbol'] = 1 if '@' in url else 0
    features['has_double_slash'] = 1 if '//' in url[7:] else 0
    features['has_prefix_suffix'] = 1 if '-' in extracted.domain else 0

    # Path features
    features['path_length'] = len(path)
    features['num_path_components'] = len(
        [x for x in path.split('/') if x])

    # Ratio features
    features['digit_ratio'] = (
        features['num_digits'] / len(url) if len(url) > 0 else 0
    )
    features['letter_ratio'] = (
        sum(c.isalpha() for c in url) / len(url) if len(url) > 0 else 0
    )

    # Suspicious keywords in URL
    suspicious_keywords = [
        'login', 'signin', 'verify', 'secure', 'account',
        'update', 'banking', 'confirm', 'password', 'paypal',
        'ebay', 'amazon', 'microsoft', 'apple', 'google'
    ]
    features['has_suspicious_keyword'] = 1 if any(
        kw in url.lower() for kw in suspicious_keywords) else 0

    features['num_suspicious_keywords'] = sum(
        1 for kw in suspicious_keywords if kw in url.lower()
    )

    return features


if __name__ == "__main__":
    # Test it
    test_urls = [
        "https://www.google.com",
        "http://paypa1-secure.tk/login/verify?account=update",
        "http://192.168.1.1/login.php",
        "https://amazon-secure-login.suspicious.com/verify"
    ]

    for url in test_urls:
        print(f"\nURL: {url}")
        features = extract_url_features(url)
        for key, value in features.items():
            print(f"  {key}: {value}")