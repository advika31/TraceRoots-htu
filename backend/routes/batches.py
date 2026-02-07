# backend/routes/batches.py
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid
import datetime
import hashlib
from database import get_db
import models
import schemas
from utils.qr_utils import generate_qr

router = APIRouter(prefix="/batches", tags=["Batches"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/all", response_model=List[schemas.Batch])
def get_all_batches(db: Session = Depends(get_db)):
    return db.query(models.Batch).order_by(models.Batch.harvest_date.desc()).all()

def _get_setting(db: Session, key: str, default: str = "") -> str:
    setting = db.query(models.GlobalSettings).filter(models.GlobalSettings.key == key).first()
    return setting.value if setting else default

def _notify_regulator(db: Session, message: str, priority: str = "Important"):
    regulator = db.query(models.User).filter(models.User.role == "REGULATOR").first()
    if not regulator:
        return
    db.add(models.Notification(
        user_id=regulator.id,
        type=models.NotificationType.ALERT,
        sender="System",
        priority=priority,
        message=message
    ))

@router.post("/create", response_model=schemas.Batch)
def create_batch(
    farmer_id: int = Form(...),
    crop_name: str = Form(...),
    quantity: float = Form(...),
    location: str = Form(...),
    region: str = Form(None),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    # 1. Parse Location
    lat, lng = 0.0, 0.0
    try:
        parts = location.split(",")
        lat = float(parts[0])
        lng = float(parts[1])
    except:
        pass 

    # 2. Validate Photos
    if not files or len(files) < 2:
        raise HTTPException(status_code=400, detail="Please upload at least 2 photos from different angles.")

    file_hashes = set()
    file_payloads = []

    for file in files:
        content = file.file.read()
        file_hash = hashlib.sha256(content).hexdigest()
        if file_hash in file_hashes:
            raise HTTPException(status_code=400, detail="Duplicate photo detected. Please upload different angles.")
        file_hashes.add(file_hash)
        file_payloads.append((file.filename, content))

    # 3. Create Batch
    new_batch_id = str(uuid.uuid4())[:8]
    db_batch = models.Batch(
        batch_id=new_batch_id,
        farmer_id=farmer_id,
        crop_name=crop_name,
        quantity=quantity,
        harvest_date=datetime.datetime.utcnow(),
        expiry_date=datetime.datetime.utcnow() + datetime.timedelta(days=7),
        latitude=lat,
        longitude=lng,
        region=region or "Local Farm", 
        status=models.BatchStatus.HARVESTED
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)

    # 4. Handle Images (Multiple Angles)
    for idx, (filename, content) in enumerate(file_payloads):
        file_ext = filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        new_image = models.BatchImage(
            batch_id=db_batch.id,
            image_url=f"/static/uploads/{unique_filename}",
            description=f"Harvest Photo Angle {idx + 1}"
        )
        db.add(new_image)
    
    # 5. Add Timeline Event
    db.add(models.BatchEvent(
        batch_id=db_batch.id,
        event_type="HARVEST",
        description=f"Farmer uploaded {quantity}kg of {crop_name}",
        location=f"{lat},{lng}"
    ))

    # 6. Generate QR
    qr_payload = {
        "batch_id": db_batch.batch_id,
        "crop_name": db_batch.crop_name,
        "farmer_id": db_batch.farmer_id
    }
    qr_path = generate_qr(db_batch.batch_id, qr_payload)
    qr_url = "/" + qr_path.replace("\\", "/")
    db_batch.qr_code_url = qr_url

    # 7. Alerts for Regulator (Banned/Suspicious)
    banned_regions = [r.strip().lower() for r in _get_setting(db, "BANNED_REGIONS", "").split(",") if r.strip()]
    if region and any(r in region.lower() for r in banned_regions):
        _notify_regulator(db, f"Alert: Harvest uploaded from banned zone {region}.", "Urgent")

    if crop_name.lower() == "saffron" and region and "kashmir" not in region.lower():
        _notify_regulator(db, f"Alert: Saffron uploaded from non-Kashmir region ({region}).", "Important")

    db.commit()
    db.refresh(db_batch)
    return db_batch

@router.get("/farmer/{farmer_id}", response_model=List[schemas.Batch])
def get_my_batches(farmer_id: int, db: Session = Depends(get_db)):
    return db.query(models.Batch).filter(models.Batch.farmer_id == farmer_id).order_by(models.Batch.harvest_date.desc()).all()

@router.get("/{batch_id}", response_model=schemas.Batch)
def get_batch_by_id(batch_id: str, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch
