import hashlib
import json
from datetime import datetime
from typing import Dict


def sha256_hash(data: str) -> str:
    """
    Returns SHA256 hash of a string
    """
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def generate_origin_hash(
    latitude: float,
    longitude: float,
    region: str
) -> str:
    """
    Hash of location data (privacy-preserving)
    """
    origin_string = f"{round(latitude,5)}|{round(longitude,5)}|{region.lower()}"
    return sha256_hash(origin_string)


def generate_onchain_record(
    batch_id: str,
    crop_type: str,
    latitude: float,
    longitude: float,
    region: str,
    expiry_date: str  # ISO format: YYYY-MM-DD
) -> Dict:

    origin_hash = generate_origin_hash(latitude, longitude, region)

    onchain_data = {
        "batchId": batch_id,
        "cropType": crop_type.lower(),
        "originHash": origin_hash,
        "expiryDate": expiry_date,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

    return onchain_data


def hash_onchain_record(onchain_data: Dict) -> str:
    encoded = json.dumps(onchain_data, sort_keys=True)
    return sha256_hash(encoded)
