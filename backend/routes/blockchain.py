# backend/routes/blockchain.py
# TraceRoots blockchain verification and registration

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from utils.blockchain_utils import (
    create_batch_onchain,
    get_batch_from_chain,
    is_batch_on_chain,
)

router = APIRouter(prefix="/blockchain", tags=["blockchain"])


@router.get("/batch/{batch_id}")
def verify_batch(batch_id: str, db: Session = Depends(get_db)):
    """Get batch from DB and verify on-chain status."""
    batch = (
        db.query(models.Batch)
        .filter(models.Batch.batch_id == batch_id)
        .first()
    )
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    on_chain_data = get_batch_from_chain(batch_id)
    return {
        "batch_id": batch.batch_id,
        "crop_name": batch.crop_name,
        "on_chain": on_chain_data is not None,
        "blockchain_tx_hash": batch.blockchain_tx_hash,
        "chain_data": on_chain_data,
    }


@router.post("/register/{batch_id}")
def register_batch_on_chain(batch_id: str, db: Session = Depends(get_db)):
    """Register an existing batch on the TraceRoots contract."""
    batch = (
        db.query(models.Batch)
        .filter(models.Batch.batch_id == batch_id)
        .first()
    )
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    if not batch.origin_hash:
        raise HTTPException(
            status_code=400,
            detail="Batch has no origin_hash (verification data).",
        )
    if not batch.expiry_date:
        raise HTTPException(
            status_code=400,
            detail="Batch has no expiry_date.",
        )
    if is_batch_on_chain(batch_id):
        return {
            "batch_id": batch_id,
            "message": "Already registered on chain",
            "blockchain_tx_hash": batch.blockchain_tx_hash,
        }
    try:
        expiry_ts = int(batch.expiry_date.timestamp())
        tx_hash = create_batch_onchain(
            batch_id=batch.batch_id,
            crop_type=batch.crop_name,
            origin_hash=batch.origin_hash,
            expiry_timestamp=expiry_ts,
        )
        batch.blockchain_tx_hash = tx_hash
        db.commit()
        db.refresh(batch)
        return {
            "batch_id": batch_id,
            "blockchain_tx_hash": tx_hash,
            "message": "Registered on chain",
        }
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Blockchain error: {str(e)}")
