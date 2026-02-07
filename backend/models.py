# backend/models.py
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

# --- ENUMS ---
class BatchStatus(str, enum.Enum):
    HARVESTED = "HARVESTED"       
    AT_PROCESSOR = "AT_PROCESSOR" 
    LAB_TESTED = "LAB_TESTED"     
    IN_TRANSIT = "IN_TRANSIT"
    SOLD = "SOLD"                 
    DONATION_READY = "DONATION_READY" 
    DISTRIBUTED = "DISTRIBUTED"   
    EXPIRED = "EXPIRED"

class UserRole(str, enum.Enum):
    COLLECTOR = "COLLECTOR" 
    PROCESSOR = "PROCESSOR"
    REGULATOR = "REGULATOR"
    CONSUMER = "CONSUMER"
    NGO = "NGO"

class NotificationType(str, enum.Enum):
    ALERT = "ALERT"     
    INFO = "INFO"       
    SUCCESS = "SUCCESS" 

# --- TABLES ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    location = Column(String) 
    role = Column(String)     
    
    # Gamification
    reputation_score = Column(Integer, default=100)
    impact_tokens = Column(Integer, default=0)

    # Relationships
    batches = relationship("Batch", back_populates="owner")
    lab_reports = relationship("LabReport", back_populates="processor")
    notifications = relationship("Notification", back_populates="user")
    feedbacks = relationship("ConsumerFeedback", back_populates="farmer")

class GlobalSettings(Base):
    """Regulator settings like Thresholds"""
    __tablename__ = "global_settings"
    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True) 
    value = Column(String)           

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(String, default=NotificationType.INFO)
    sender = Column(String, nullable=True)
    priority = Column(String, default="Normal")
    message = Column(String)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, unique=True, index=True) 
    
    farmer_id = Column(Integer, ForeignKey("users.id"))
    
    crop_name = Column(String)
    quantity = Column(Float)
    harvest_date = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default=BatchStatus.HARVESTED)
    video_story_url = Column(String, nullable=True)
    qr_code_url = Column(String, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
        
    # Location (Geospatial)
    latitude = Column(Float, default=0.0)
    longitude = Column(Float, default=0.0)
    region = Column(String) 

    # Processor Grading
    freshness_score = Column(Float, nullable=True)
    quality_grade = Column(String, nullable=True)
    estimated_shelf_life = Column(Integer, nullable=True)
    visual_defects = Column(String, nullable=True)
    processor_notes = Column(String, nullable=True)

    # Blockchain
    blockchain_tx_hash = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)

    # Relationships
    owner = relationship("User", back_populates="batches")
    images = relationship("BatchImage", back_populates="batch") 
    timeline_events = relationship("BatchEvent", back_populates="batch")
    lab_report = relationship("LabReport", back_populates="batch", uselist=False)
    feedbacks = relationship("ConsumerFeedback", back_populates="batch")

class BatchImage(Base):
    """Stores multiple angles of the crop"""
    __tablename__ = "batch_images"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    image_url = Column(String)
    description = Column(String, nullable=True) 
    
    batch = relationship("Batch", back_populates="images")

class BatchEvent(Base):
    __tablename__ = "batch_events"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event_type = Column(String) 
    description = Column(String)
    location = Column(String)
    
    batch = relationship("Batch", back_populates="timeline_events")

class LabReport(Base):
    __tablename__ = "lab_reports"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    processor_id = Column(Integer, ForeignKey("users.id"))
    test_date = Column(DateTime, default=datetime.datetime.utcnow)
    report_file_url = Column(String) 
    result_summary = Column(String)
    
    batch = relationship("Batch", back_populates="lab_report")
    processor = relationship("User", back_populates="lab_reports")

class ConsumerFeedback(Base):
    __tablename__ = "consumer_feedback"
    id = Column(Integer, primary_key=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    farmer_id = Column(Integer, ForeignKey("users.id")) 
    rating = Column(Integer)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    batch = relationship("Batch", back_populates="feedbacks")
    farmer = relationship("User", back_populates="feedbacks")