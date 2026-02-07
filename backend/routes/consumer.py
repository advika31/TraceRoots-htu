from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
from utils.tts_utils import generate_voiceover
from utils.video_utils import generate_video

router = APIRouter(prefix="/consumer", tags=["Consumer"])


@router.get("/video/{batch_id}")
def get_or_generate_video(batch_id: str, db: Session = Depends(get_db)):
    batch = (
        db.query(models.Batch)
        .filter(models.Batch.batch_id == batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    # ✅ CACHE CHECK
    if batch.video_story_url:
        return {"video_url": batch.video_story_url}

    # ✅ Use fields that ACTUALLY EXIST
    freshness = int(batch.freshness_score or 85)
    grade = batch.quality_grade or "High"

    story_text = (
        f"Meet your food. "
        f"This {batch.crop_name} was harvested on {batch.harvest_date.date()} "
        f"in {batch.region or 'India'}. "
        f"It has a freshness score of {freshness} percent "
        f"and was graded {grade} quality. "
        f"This batch is secured on blockchain for authenticity."
    )

    audio_path = generate_voiceover(story_text, batch.batch_id)
    video_path = generate_video(batch, audio_path)

    video_url = f"http://127.0.0.1:8000/{video_path}"

    batch.video_story_url = video_url
    db.commit()

    return {"video_url": video_url}
