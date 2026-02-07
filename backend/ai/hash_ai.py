import numpy as np
import hashlib

def vector_to_hash(vector: np.ndarray, precision=2) -> str:
    quantized = np.round(vector, precision)
    byte_data = quantized.tobytes()
    return hashlib.sha256(byte_data).hexdigest()

