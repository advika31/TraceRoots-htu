# utils/qr_utils.py
import os
import qrcode
import json

def generate_qr(batch_id: int, data: dict):
    # Convert dict to a readable JSON string
    qr_data = json.dumps(data, indent=2)

    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=5
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    img = qr.make_image(fill='black', back_color='white')
    save_dir = "static/qr"
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, f"{batch_id}.png")
    img.save(save_path)

    return save_path  