from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
import datetime
from database import get_db
import models
import schemas

router = APIRouter(prefix="/processor", tags=["Processor"])

UPLOAD_DIR = "static/reports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
@router.post("/save-grading/{batch_id}")
def save_batch_grading(
    batch_id: str,
    grading: schemas.BatchGradingUpdate, 
    db: Session = Depends(get_db)
):
    """
    Saves the AI Grading results to the batch.
    """
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Update Batch Fields
    batch.quality_grade = grading.quality_grade
    batch.freshness_score = grading.freshness_score
    batch.estimated_shelf_life = grading.estimated_shelf_life
    batch.visual_defects = grading.visual_defects
    batch.processor_notes = grading.processor_notes
    
    # Mark as Tested
    batch.status = models.BatchStatus.LAB_TESTED
    
    # Add Timeline Event
    db.add(models.BatchEvent(
        batch_id=batch.id,
        event_type="LAB_TEST",
        description=f"Graded {grading.quality_grade} (Freshness: {grading.freshness_score}%)",
        location="Processing Center"
    ))

    db.commit()
    return {"message": "Grading saved successfully", "status": "LAB_TESTED"}

# 2. Upload Lab Report (PDF/Image)
@router.post("/lab-report/{batch_id}")
def upload_lab_report(
    batch_id: str,
    result_summary: str = Form(...),
    processor_id: str = Form(...), 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Uploads the physical lab report image.
    """
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # Save File
    file_ext = file.filename.split(".")[-1]
    unique_filename = f"{batch_id}_report.{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Generate URL
    report_url = f"/static/reports/{unique_filename}"
    
    # Update or Create Lab Report Entry
    if batch.lab_report:
        batch.lab_report.report_file_url = report_url
        batch.lab_report.result_summary = result_summary
        batch.lab_report.test_date = datetime.datetime.utcnow()
    else:
        new_report = models.LabReport(
            batch_id=batch.id,
            processor_id=int(processor_id),
            report_file_url=report_url,
            result_summary=result_summary
        )
        db.add(new_report)

    db.commit()
    return {"message": "Report uploaded successfully", "report_url": report_url}

# 3. Update Status (Generic)
@router.put("/status/{batch_id}")
def update_batch_status(batch_id: str, status: str, db: Session = Depends(get_db)):
    batch = db.query(models.Batch).filter(models.Batch.batch_id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    batch.status = status
    db.commit()
    return {"message": "Status updated"}