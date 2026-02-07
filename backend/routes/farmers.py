# backend/routes/farmers.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter(prefix="/farmers", tags=["Farmers"])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Routes ---

@router.post("/signup", response_model=schemas.Token)
def create_farmer(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if username exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # 2. Create User (Role = COLLECTOR)
    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name,
        location=user.location,
        role=models.UserRole.COLLECTOR, 
        reputation_score=100,
        impact_tokens=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # 3. Return Token
    return {
        "access_token": new_user.username, 
        "token_type": "bearer",
        "user_id": new_user.id,
        "role": new_user.role
    }

@router.post("/login", response_model=schemas.Token)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {
        "access_token": user.username,
        "token_type": "bearer",
        "user_id": user.id,
        "role": user.role
    }

@router.get("/{user_id}/stats")
def get_farmer_stats(user_id: int, db: Session = Depends(get_db)):
    # 1. Get Batch Count
    count = db.query(models.Batch).filter(models.Batch.farmer_id == user_id).count()
    
    # 2. Get User details
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return {"batches": 0, "tokens": 0, "zone": "Unknown"}

    return {
        "batches": count,
        "tokens": user.impact_tokens,
        "zone": "Green (Safe)" 
    }

@router.get("/{user_id}/notifications")
def get_farmer_notifications(user_id: int, db: Session = Depends(get_db)):
    notes = db.query(models.Notification).filter(
        models.Notification.user_id == user_id
    ).order_by(models.Notification.timestamp.desc()).limit(50).all()
    return [
        {
            "id": n.id,
            "message": n.message,
            "type": n.type,
            "priority": n.priority,
            "timestamp": n.timestamp
        } for n in notes
    ]
