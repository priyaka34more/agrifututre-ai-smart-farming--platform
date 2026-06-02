from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
from database import Base

class DetectionHistory(Base):
    __tablename__ = "detection_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=True) # Linked to User.id
    disease = Column(String)
    confidence = Column(Float)
    result_json = Column(String)
    region = Column(String, default="Unknown") # For outbreak alerts
    created_at = Column(DateTime, default=datetime.utcnow)