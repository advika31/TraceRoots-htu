# // backend/routes/blockchain.py
from fastapi import APIRouter, HTTPException, Depends
from utils.blockchain_utils import verify_batch_onchain
from sqlalchemy.orm import Session
from database import get_db
from models import User, Batch

router = APIRouter(prefix="/blockchain", tags=["blockchain"])


@router.get("/batch/{batch_id}")
def verify_batch(batch_id: int, db: Session = Depends(get_db)):
    batch = db.get(FoodBatch, batch_id)
    farmer = db.get(Farmer, batch.farmer_id)
    try:
        exists = verify_batch_onchain(batch_id, batch.crop_type, batch.quantity_kg, farmer.wallet_address)
        return {"batch_id": batch_id, "crop_type": batch.crop_type, "on_chain": exists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



