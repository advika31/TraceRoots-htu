from pathlib import Path
from ai.vectorize import image_to_vector
from ai.hash_ai import vector_to_hash
image_path = Path("ai/static/test1.png")

vector = image_to_vector(image_path)
hash_val = vector_to_hash(vector)


print("Vector shape:", vector.shape)
print("First 10 values:", vector[:10])
print("Hash:", hash_val)
