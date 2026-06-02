import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from database import Base

class YieldPrediction(Base):
    __tablename__ = "yield_predictions"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    user_id = Column(
        String,
        nullable=True,
        index=True
    )
    full_name = Column(
        String,
        nullable=True
    )
    crop_name = Column(
        String,
        nullable=False
    )
    soil_type = Column(
        String,
        nullable=False
    )
    rainfall = Column(
        Float,
        nullable=False
    )
    temperature = Column(
        Float,
        nullable=False
    )
    humidity = Column(
        Float,
        nullable=False
    )
    predicted_yield = Column(
        Float,
        nullable=False
    )
    confidence = Column(
        Float,
        nullable=False
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
