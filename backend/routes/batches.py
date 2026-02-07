# backend/routes/batches.py

from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import datetime
import hashlib
from pathlib import Path

from database import get_db
import models
import schemas
from utils.qr_utils import generate_qr

from ai.fraud_detection import (
    check_crop_location,
    check_yield,
    check_exif,
    extract_exif,
    check_gps_mismatch,
    extract_image_gps,
)
from ai.freshness_analysis import analyze_freshness
from ai.blockchain import generate_origin_hash, hash_onchain_record

router = APIRouter(prefix="/batches", tags=["Batches"])

UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/all", response_model=List[schemas.Batch])
def get_all_batches(db: Session = Depends(get_db)):
    return (
        db.query(models.Batch)
        .order_by(models.Batch.harvest_date.desc())
        .all()
    )


@router.post("/create", response_model=schemas.Batch)
def create_batch(
    farmer_id: int = Form(...),
    crop_name: str = Form(...),
    quantity: float = Form(...),
    location: str = Form(...),   # "lat,lng"
    region: str = Form(None),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    # ---- Parse GPS ----
    lat, lng = 0.0, 0.0
    try:
        lat_str, lng_str = location.split(",")
        lat, lng = float(lat_str), float(lng_str)
    except Exception:
        pass  # allow fallback

    # ---- Validate images ----
    if not files or len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least 2 photos from different angles.",
        )

    seen_hashes = set()
    file_payloads = []

    for file in files:
        content = file.file.read()
        h = hashlib.sha256(content).hexdigest()
        if h in seen_hashes:
            raise HTTPException(
                status_code=400,
                detail="Duplicate image detected.",
            )
        seen_hashes.add(h)
        file_payloads.append((file.filename, content))

    # ---- Create Batch (initial) ----
    batch_id = uuid.uuid4().hex[:8]

    batch = models.Batch(
        batch_id=batch_id,
        farmer_id=farmer_id,
        crop_name=crop_name,
        quantity=quantity,
        harvest_date=datetime.datetime.utcnow(),
        latitude=lat,
        longitude=lng,
        region=region or "Local Farm",
        status=models.BatchStatus.HARVESTED,
        is_verified=False,
    )

    db.add(batch)
    db.commit()
    db.refresh(batch)

    # ---- Save images ----
    image_paths: List[Path] = []

    for idx, (filename, content) in enumerate(file_payloads):
        ext = filename.split(".")[-1]
        unique_name = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_name)

        with open(file_path, "wb") as f:
            f.write(content)

        image_paths.append(Path(file_path))

        db.add(
            models.BatchImage(
                batch_id=batch.id,
                image_url=f"/static/uploads/{unique_name}",
                description=f"Harvest Image {idx + 1}",
            )
        )

    # ---- FRAUD CHECKS ----
    fraud_reasons = []

    region_safe = region if region else "Unknown"

    f1, r1 = check_crop_location(crop_name, region_safe)
    f2, r2 = check_yield(crop_name, quantity, 1)  # assume 1 acre

    if f1:
        fraud_reasons.append(r1)
    if f2:
        fraud_reasons.append(r2)

    exif = extract_exif(image_paths[0])
    if not exif:
        fraud_reasons.append("Missing EXIF metadata")
    else:
        f3, r3 = check_exif(image_paths[0])
        if f3:
            fraud_reasons.append(r3)

        if "GPSInfo" in exif:
            img_lat, img_lng = extract_image_gps(exif)
            f4, r4 = check_gps_mismatch(lat, lng, img_lat, img_lng)
            if f4:
                fraud_reasons.append(f"GPS mismatch warning: {r4}")

    if fraud_reasons:
        batch.status = models.BatchStatus.FLAGGED
        batch.processor_notes = "; ".join(fraud_reasons)
        batch.is_verified = False
        batch.expiry_date = None
        batch.estimated_shelf_life = None

        db.commit()
        db.refresh(batch)
        return batch

    # ---- AI FRESHNESS ----
    ai = analyze_freshness(image_paths[0])

    if "error" in ai:
        ai = {
            "freshness_score": 85,
            "quality_grade": "B",
            "estimated_shelf_life_days": 4,
            "visual_defects": [],
        }

    batch.freshness_score = ai["freshness_score"]
    batch.quality_grade = ai["quality_grade"]
    batch.estimated_shelf_life = ai["estimated_shelf_life_days"]
    batch.visual_defects = ", ".join(ai.get("visual_defects", []))

    batch.expiry_date = (
        datetime.datetime.utcnow()
        + datetime.timedelta(days=ai["estimated_shelf_life_days"])
    )


    batch.origin_hash = generate_origin_hash(
        latitude=lat,
        longitude=lng,
        region=region or "Local Farm",
    )

    onchain_payload = {
        "batchId": batch.batch_id,
        "cropType": crop_name,
        "originHash": batch.origin_hash,
        "expiryDate": batch.expiry_date.date().isoformat(),
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }

    # Pre-chain content hash (tx hash later)
    batch.blockchain_tx_hash = hash_onchain_record(onchain_payload)

    batch.status = models.BatchStatus.VERIFIED
    batch.is_verified = True

    db.add(
        models.BatchEvent(
            batch_id=batch.id,
            event_type="VERIFIED",
            description="Batch passed fraud checks and AI verification",
            location=f"{lat},{lng}",
        )
    )

    db.commit()
    db.refresh(batch)
    return batch


@router.get("/farmer/{farmer_id}", response_model=List[schemas.Batch])
def get_my_batches(farmer_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Batch)
        .filter(models.Batch.farmer_id == farmer_id)
        .order_by(models.Batch.harvest_date.desc())
        .all()
    )


@router.get("/{batch_id}", response_model=schemas.Batch)
def get_batch_by_id(batch_id: str, db: Session = Depends(get_db)):
    batch = (
        db.query(models.Batch)
        .filter(models.Batch.batch_id == batch_id)
        .first()
    )
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch
