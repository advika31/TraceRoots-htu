# utils/ai_utils.py
def predict_nutrition(crop_type: str) -> float:
    import random
    crop_scores = {
        "wheat": (70, 90),
        "rice": (60, 85),
        "millet": (80, 95),
        "vegetable": (75, 98),
    }
    low, high = crop_scores.get(crop_type.lower(), (60, 90))
    return round(random.uniform(low, high), 2)



