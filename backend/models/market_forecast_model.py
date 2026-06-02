import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime
from database import Base

class MarketForecast(Base):
    __tablename__ = "market_forecasts"

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
    crop_name = Column(
        String,
        nullable=False
    )
    current_price = Column(
        Float,
        nullable=False
    )
    predicted_price = Column(
        Float,
        nullable=False
    )
    market_trend = Column(
        String,
        nullable=False
    )
    demand_level = Column(
        String,
        nullable=False
    )
    forecast_date = Column(
        String,
        nullable=False
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
