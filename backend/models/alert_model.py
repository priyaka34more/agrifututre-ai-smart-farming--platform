from sqlalchemy import Column, String, DateTime, Integer
from datetime import datetime
from database import Base

class OutbreakAlert(Base):
    __tablename__ = "outbreak_alerts"

    id = Column(Integer, primary_key=True, index=True)
    disease = Column(String, nullable=False)
    region = Column(String, nullable=False)
    severity = Column(String, default="Medium") # Low, Medium, High
    message = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
