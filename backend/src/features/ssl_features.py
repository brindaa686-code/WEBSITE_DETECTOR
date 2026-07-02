import ssl
import socket
from datetime import datetime
from urllib.parse import urlparse


def extract_ssl_features(url: str) -> dict:
    features = {}

    try:
        parsed = urlparse(url)
        hostname = parsed.netloc

        # Remove port if present
        if ':' in hostname:
            hostname = hostname.split(':')[0]

        # Check if HTTPS
        features['has_https'] = 1 if parsed.scheme == 'https' else 0

        if parsed.scheme != 'https':
            # No SSL at all
            features['ssl_valid'] = 0
            features['ssl_cert_age_days'] = -1
            features['ssl_days_to_expiry'] = -1
            features['ssl_is_trusted'] = 0
            features['ssl_issuer'] = 'none'
            features['ssl_has_san'] = 0
            return features

        # Create SSL context
        context = ssl.create_default_context()

        with socket.create_connection((hostname, 443), timeout=5) as sock:
            with context.wrap_socket(sock,
                                     server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()

        # Certificate validity dates
        not_before = datetime.strptime(
            cert['notBefore'], '%b %d %H:%M:%S %Y %Z')
        not_after = datetime.strptime(
            cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
        now = datetime.now()

        features['ssl_valid'] = 1
        features['ssl_cert_age_days'] = (now - not_before).days
        features['ssl_days_to_expiry'] = (not_after - now).days

        # Issuer info
        issuer = dict(x[0] for x in cert['issuer'])
        issuer_org = issuer.get('organizationName', 'unknown')
        features['ssl_issuer'] = issuer_org

        # Trusted issuers (major CAs)
        trusted_issuers = [
            'DigiCert', 'Let\'s Encrypt', 'Comodo',
            'GlobalSign', 'Sectigo', 'GeoTrust',
            'Amazon', 'Google Trust Services'
        ]
        features['ssl_is_trusted'] = 1 if any(
            t.lower() in issuer_org.lower()
            for t in trusted_issuers) else 0

        # Subject Alternative Names
        san = cert.get('subjectAltName', [])
        features['ssl_has_san'] = 1 if san else 0
        features['ssl_san_count'] = len(san)

    except ssl.SSLCertVerificationError:
        # Certificate verification failed = suspicious
        features['ssl_valid'] = 0
        features['ssl_cert_age_days'] = -1
        features['ssl_days_to_expiry'] = -1
        features['ssl_is_trusted'] = 0
        features['ssl_issuer'] = 'invalid'
        features['ssl_has_san'] = 0
        features['ssl_san_count'] = 0
        features['has_https'] = 1

    except Exception as e:
        print(f"  SSL check failed for {url}: {e}")
        features['ssl_valid'] = 0
        features['ssl_cert_age_days'] = -1
        features['ssl_days_to_expiry'] = -1
        features['ssl_is_trusted'] = 0
        features['ssl_issuer'] = 'unknown'
        features['ssl_has_san'] = 0
        features['ssl_san_count'] = 0
        features['has_https'] = 0

    return features


if __name__ == "__main__":
    test_urls = [
        "https://www.google.com",
        "https://www.amazon.com",
        "http://paypa1-secure.tk",
    ]

    for url in test_urls:
        print(f"\nURL: {url}")
        features = extract_ssl_features(url)
        for key, value in features.items():
            print(f"  {key}: {value}")