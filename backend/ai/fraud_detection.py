from PIL import Image
from PIL.ExifTags import TAGS
from datetime import datetime, timedelta
import numpy as np
from ai.vectorize import image_to_vector
from ai.hash_ai import vector_to_hash


MAX_YIELD_PER_ACRE = {
    "saffron": 3,     
    "wheat": 1200,   
    "apple": 8000
}

VALID_REGIONS = {
    "saffron": ["Jammu & Kashmir"],
    "apple": ["Himachal Pradesh", "Jammu & Kashmir"],
    "wheat": ["Punjab", "Haryana"]
}

def check_crop_location(crop, location):
    crop = crop.lower()
    location = location.strip()

    if crop not in VALID_REGIONS:
        return False, None  

    if location not in VALID_REGIONS[crop]:
        return True, f"{crop.title()} cannot be grown in {location}"

    return False, None

def check_yield(crop, quantity_kg, land_area_acres):
    crop = crop.lower()

    if crop not in MAX_YIELD_PER_ACRE:
        return False, None

    max_allowed = MAX_YIELD_PER_ACRE[crop] * land_area_acres

    if quantity_kg > max_allowed:
        return True, (
            f"Reported quantity {quantity_kg}kg exceeds "
            f"expected max {max_allowed}kg for {land_area_acres} acres"
        )

    return False, None


def extract_exif(image_path):
    image = Image.open(image_path)
    exif_raw = image._getexif()

    if not exif_raw:
        return None

    exif = {}
    for tag, value in exif_raw.items():
        tag_name = TAGS.get(tag, tag)
        exif[tag_name] = value

    return exif


def check_exif(image_path):
    exif = extract_exif(image_path)

    if not exif:
        return True, "No EXIF metadata found"

    if "Make" not in exif:
        return True, "Camera make missing"

    if "DateTime" in exif:
        photo_time = datetime.strptime(exif["DateTime"], "%Y:%m:%d %H:%M:%S")
        if datetime.now() - photo_time > timedelta(days=7):
            return True, "Photo is too old"

    return False, None

#cosine similarity function and fraud check logic
def cosine_similarity(vec1, vec2):
    return np.dot(vec1, vec2) / (
        np.linalg.norm(vec1) * np.linalg.norm(vec2)
    )


def check_image_similarity(image_path, reference_vector):
    """
    Flags fraud if cosine similarity < 40%
    """
    from ai.vectorize import image_to_vector  

    current_vector = image_to_vector(image_path)
    similarity = cosine_similarity(current_vector, reference_vector)

    if similarity < 0.40:
        return True, f"Image similarity too low ({similarity:.2f})"

    return False, None



def run_fraud_checks(data, image_path, reference_vector=None):
    flags = []

    checks = [
        check_crop_location(data["crop"], data["location"]),
        check_yield(data["crop"], data["quantity_kg"], data["land_area"]),
        check_exif(image_path),
    ]

        # Only apply cosine similarity AFTER farmer stage
    if data["actor_role"] != "farmer":
        if reference_vector is None:
            flags.append("Missing reference image for comparison")
        else:
            checks.append(
                check_image_similarity(image_path, reference_vector)
            )

    for is_fraud, reason in checks:
        if is_fraud:
            flags.append(reason)

    return {
        "fraud_flag": len(flags) > 0,
        "reasons": flags
    }
    
if __name__ == "__main__":
    data = {
        "crop": "Tomato",
        "quantity_kg": 5,
        "land_area": 1,
        "location": "Uttar Pradesh",
        "actor_role": "farmer"
    }
    image_path = "ai/static/test2.png"
    result = run_fraud_checks(data, image_path)
    print(result)
