import hashlib
import json

def hash_record(data):
    encoded = json.dumps(data, sort_keys=True).encode()
    return hashlib.sha256(encoded).hexdigest()

def verify_record(data, expected_hash):
    return hash_record(data) == expected_hash