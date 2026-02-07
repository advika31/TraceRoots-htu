# /backend/routes/regulator.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.responses import StreamingResponse
import csv
import io
from database import get_db
import models
import schemas

router = APIRouter(prefix="/regulator", tags=["Regulator"])

def _get_setting(db: Session, key: str, default: str = "") -> str:
    setting = db.query(models.GlobalSettings).filter(models.GlobalSettings.key == key).first()
    return setting.value if setting else default

def _set_setting(db: Session, key: str, value: str):
    setting = db.query(models.GlobalSettings).filter(models.GlobalSettings.key == key).first()
    if setting:
        setting.value = value
    else:
        db.add(models.GlobalSettings(key=key, value=value))
    db.commit()

# --- SUSTAINABILITY MAP DATA ---
@router.get("/map-data")
def get_sustainability_map(db: Session = Depends(get_db)):
    """
    Returns all batches with their location and calculated 'Stress Level'.
    If many farmers harvest in the same region, it flags as 'RED' (Over-farming).
    """
    batches = db.query(models.Batch).all()
    map_points = []
    
    region_counts = {}
    for b in batches:
        region = b.region or "Unknown"
        region_counts[region] = region_counts.get(region, 0) + 1

    for batch in batches:
        count = region_counts.get(batch.region, 0)
        status_color = "RED" if count > 5 else "GREEN"
        
        map_points.append({
            "batch_id": batch.batch_id,
            "lat": batch.latitude or 30.73, # Default to Chandigarh if missing
            "lng": batch.longitude or 76.77,
            "crop": batch.crop_name,
            "farmer": batch.owner.full_name if batch.owner else "Unknown",
            "region": batch.region or "Unknown",
            "zone_status": status_color,
            "stress_score": count * 10 # Mock score
        })
    
    return map_points

# --- ALERTS & NOTIFICATIONS ---
@router.get("/alerts")
def get_recent_alerts(db: Session = Depends(get_db)):
    """
    Returns alerts for the Regulator Dashboard.
    """
    max_limit = float(_get_setting(db, "MAX_HARVEST_LIMIT", "500"))
    alerts = []

    farmers = db.query(models.User).filter(models.User.role == "COLLECTOR").all()
    for farmer in farmers:
        total_kg = sum([b.quantity for b in farmer.batches])
        if total_kg > max_limit:
            alerts.append({
                "farmer_id": farmer.id,
                "farmer_name": farmer.full_name or farmer.username,
                "total_harvested_kg": total_kg,
                "threshold_kg": max_limit,
                "severity": "HIGH" if total_kg > (max_limit * 1.5) else "MEDIUM"
            })

    regulator = db.query(models.User).filter(models.User.role == "REGULATOR").first()
    notifications = []
    if regulator:
        notifications = db.query(models.Notification).filter(
            models.Notification.user_id == regulator.id,
            models.Notification.type == models.NotificationType.ALERT
        ).order_by(models.Notification.timestamp.desc()).limit(20).all()

    return {
        "alerts": alerts,
        "notifications": [
            {
                "id": n.id,
                "message": n.message,
                "priority": n.priority,
                "timestamp": n.timestamp
            } for n in notifications
        ]
    }

@router.get("/thresholds")
def get_thresholds(db: Session = Depends(get_db)):
    limit = db.query(models.GlobalSettings).filter(models.GlobalSettings.key == "MAX_HARVEST_LIMIT").first()
    zones = db.query(models.GlobalSettings).filter(models.GlobalSettings.key == "BANNED_ZONES").first()
    
    return {
        "max_harvest_limit": limit.value if limit else "500",
        "banned_regions": zones.value if zones else ""
    }

@router.post("/thresholds")
def set_thresholds(
    max_harvest_limit: str, 
    banned_regions: str, 
    db: Session = Depends(get_db)
):
    limit = db.query(models.GlobalSettings).filter(models.GlobalSettings.key == "MAX_HARVEST_LIMIT").first()
    if not limit:
        limit = models.GlobalSettings(key="MAX_HARVEST_LIMIT", value=max_harvest_limit)
        db.add(limit)
    else:
        limit.value = max_harvest_limit
        
    zones = db.query(models.GlobalSettings).filter(models.GlobalSettings.key == "BANNED_ZONES").first()
    if not zones:
        zones = models.GlobalSettings(key="BANNED_ZONES", value=banned_regions)
        db.add(zones)
    else:
        zones.value = banned_regions
        
    db.commit()
    return {"message": "Regulatory thresholds updated successfully"}

@router.get("/export")
def export_data(db: Session = Depends(get_db)):
    batches = db.query(models.Batch).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["batch_id", "crop_name", "quantity", "region", "harvest_date", "status"])
    for b in batches:
        writer.writerow([b.batch_id, b.crop_name, b.quantity, b.region, b.harvest_date, b.status])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=traceability_report.csv"}
    )

@router.post("/message")
def send_warning(farmer_id: int, message: str, priority: str = "Important", db: Session = Depends(get_db)):
    farmer = db.query(models.User).filter(models.User.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    db.add(models.Notification(
        user_id=farmer.id,
        type=models.NotificationType.ALERT,
        sender="Regulator",
        priority=priority,
        message=message
    ))
    db.commit()
    return {"status": "Sent"}

@router.get("/messages")
def get_sent_messages(db: Session = Depends(get_db)):
    messages = db.query(models.Notification).filter(models.Notification.sender == "Regulator").order_by(
        models.Notification.timestamp.desc()
    ).limit(50).all()
    return [
        {
            "id": m.id,
            "farmer_id": m.user_id,
            "message": m.message,
            "priority": m.priority,
            "timestamp": m.timestamp
        } for m in messages
    ]

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [
        {
            "id": u.id,
            "name": u.full_name or u.username,
            "role": u.role,
            "location": u.location or "Unknown"
        } for u in users
    ]

@router.get("/verify/{batch_id}")
def verify_batch(batch_id: str, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return {
        "on_chain_verified": bool(batch.is_verified),
        "status": batch.status,
        "blockchain_tx": batch.blockchain_tx_hash
    }
