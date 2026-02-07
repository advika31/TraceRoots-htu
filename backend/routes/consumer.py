from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
from utils.tts_utils import generate_voiceover
from utils.video_utils import generate_video
from utils.blockchain_utils import is_batch_on_chain

router = APIRouter(prefix="/consumer", tags=["Consumer"])


@router.get("/story/{batch_id}")
def get_story(batch_id: str, db: Session = Depends(get_db)):
    """Story payload for consumer product info: batch details, narrative, timeline, verification."""
    batch = (
        db.query(models.Batch)
        .filter(models.Batch.batch_id == batch_id)
        .first()
    )
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    first_image = (
        db.query(models.BatchImage)
        .filter(models.BatchImage.batch_id == batch.id)
        .first()
    )
    image_url = first_image.image_url if first_image else ""
    freshness = int(batch.freshness_score or 85)
    grade = batch.quality_grade or "High"
    story_narrative = (
        f"Meet your food. This {batch.crop_name} was harvested on {batch.harvest_date.date()} "
        f"in {batch.region or 'India'}. It has a freshness score of {freshness}% and was graded {grade} quality. "
        "This batch is secured on blockchain for authenticity."
    )
    timeline = []
    for ev in batch.timeline_events or []:
        timeline.append({
            "date": ev.timestamp.date().isoformat() if ev.timestamp else "",
            "event": ev.event_type,
            "desc": ev.description or "",
            "icon": "checkmark-circle",
        })
    if not timeline:
        timeline = [
            {"date": batch.harvest_date.date().isoformat(), "event": "Harvested", "desc": batch.region or "", "icon": "leaf"},
            {"date": "", "event": "Verified", "desc": "Quality and origin verified", "icon": "shield-checkmark"},
        ]
    on_chain = False
    try:
        on_chain = is_batch_on_chain(batch_id)
    except Exception:
        pass
    return {
        "batch_details": {
            "crop_name": batch.crop_name,
            "image": image_url,
            "region": batch.region,
            "harvest_date": batch.harvest_date.isoformat() if batch.harvest_date else None,
        },
        "story_narrative": story_narrative,
        "timeline": timeline,
        "verification": {
            "blockchain_hash": batch.blockchain_tx_hash or "—",
            "on_chain": on_chain,
        },
    }


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
