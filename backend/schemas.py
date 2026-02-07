# backend/schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from models import BatchStatus, UserRole 

# --- Auth ---
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    location: Optional[str] = None
    role: UserRole = UserRole.COLLECTOR

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    role: str

# --- Components ---
class BatchImage(BaseModel):
    image_url: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class BatchEvent(BaseModel):
    timestamp: datetime
    event_type: str
    description: str
    location: Optional[str] = None
    class Config:
        from_attributes = True

class LabReport(BaseModel):
    test_date: datetime
    result_summary: str
    report_file_url: str
    class Config:
        from_attributes = True

class Feedback(BaseModel):
    rating: int
    comment: Optional[str] = None
    timestamp: datetime
    class Config:
        from_attributes = True

# --- Batch ---
class BatchBase(BaseModel):
    crop_name: str
    quantity: float
    latitude: float = 0.0
    longitude: float = 0.0
    region: Optional[str] = None

class BatchCreate(BatchBase):
    pass

class BatchGradingUpdate(BaseModel):
    quality_grade: str
    freshness_score: float
    estimated_shelf_life: int
    visual_defects: Optional[str] = "None"
    processor_notes: Optional[str] = None
    
class Batch(BatchBase):
    id: int
    batch_id: str
    farmer_id: int
    harvest_date: datetime
    expiry_date: Optional[datetime] = None
    status: BatchStatus
    qr_code_url: Optional[str] = None
    
    # Processor & Blockchain
    quality_grade: Optional[str] = None
    freshness_score: Optional[float] = None
    estimated_shelf_life: Optional[int] = None
    visual_defects: Optional[str] = None
    processor_notes: Optional[str] = None
    
    blockchain_tx_hash: Optional[str] = None
    is_verified: bool = False 

    # Relations
    images: List[BatchImage] = []
    timeline_events: List[BatchEvent] = []
    lab_report: Optional[LabReport] = None
    feedbacks: List[Feedback] = []

    class Config:
        from_attributes = True
