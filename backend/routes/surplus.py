from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import datetime
import models

router = APIRouter(prefix="/surplus", tags=["Surplus & NGO"])

# 1. List Available Donations (For NGOs to Accept)
@router.get("/available")
def get_available_donations(db: Session = Depends(get_db)):
    """
    Shows batches that are marked 'DONATION_READY' by Processors.
    """
    return db.query(models.Batch).filter(models.Batch.status == "DONATION_READY").all()

# 2. List Claimed History (For NGO Dashboard)
@router.get("/claimed")
def get_claimed_donations(db: Session = Depends(get_db)):
    """
    Shows batches that have been accepted/claimed (DISTRIBUTED).
    """
    return db.query(models.Batch).filter(models.Batch.status == "DISTRIBUTED").all()

# 3. Processor Offers Donation
@router.post("/donate/{batch_id}")
def donate_batch(batch_id: str, db: Session = Depends(get_db)):
    """
    Processor marks a batch as available for NGO.
    """
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch.status = "DONATION_READY"
    
    if batch.owner:
        batch.owner.impact_tokens += 50 
        
    db.commit()
    return {"message": "Batch offered to NGOs", "impact_tokens_earned": 50}

# 4. NGO Accepts/Claims Donation
@router.post("/claim/{batch_id}")
def claim_donation(batch_id: str, ngo_id: int, db: Session = Depends(get_db)):
    """
    NGO accepts the donation offer.
    """
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    if batch.status != "DONATION_READY":
        raise HTTPException(status_code=400, detail="Batch is not available")

    batch.status = "DISTRIBUTED"
    
    new_event = models.BatchEvent(
        batch_id=batch.id,
        event_type="DONATION",
        description=f"Accepted by NGO #{ngo_id}",
        timestamp=datetime.datetime.utcnow(),
        location="NGO HQ"
    )
    db.add(new_event)
    db.commit()
    
    return {"message": "Donation accepted and claimed"}

# 5. Auto-Scan 
@router.post("/scan-expiring")
def scan_expiring_batches(db: Session = Depends(get_db)):
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    expired = db.query(models.Batch).filter(
        models.Batch.harvest_date < cutoff,
        models.Batch.status == "HARVESTED"
    ).all()
    
    count = 0
    for b in expired:
        b.status = "DONATION_READY"
        count += 1
    
    db.commit()
    return {"message": f"Auto-scanned: {count} moved to surplus"}