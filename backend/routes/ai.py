from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import random
import time

router = APIRouter(prefix="/ai", tags=["AI Services"])

# 1. Analyze by Upload (Legacy/Direct)
@router.post("/analyze")
async def analyze_crop_quality(file: UploadFile = File(...)):
    time.sleep(1.5) 
    return generate_mock_score()

# 2. Analyze Existing Batch Image 
@router.post("/analyze-batch/{batch_id}")
def analyze_batch_image(batch_id: str, db: Session = Depends(get_db)):
    """
    Fetches the first image of the batch from DB and runs AI analysis.
    """
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    if not batch.images:
        raise HTTPException(status_code=400, detail="No images found for this batch")

    time.sleep(1.5) 
    
    return generate_mock_score()

def generate_mock_score():
    score = random.randint(75, 98)
    
    grade = "A"
    if score < 90: grade = "B"
    if score < 75: grade = "C"
    
    shelf_life = 7
    if grade == "A": shelf_life = 14
    if grade == "B": shelf_life = 10

    defects = "None detected"
    if grade == "B": defects = "Minor discoloration"
    if grade == "C": defects = "Visible bruising"

    return {
        "freshness_score": float(score),
        "quality_grade": grade,
        "estimated_shelf_life": shelf_life,
        "visual_defects": defects,
        "processor_notes": f"Automated grading completed. {defects}."
    }