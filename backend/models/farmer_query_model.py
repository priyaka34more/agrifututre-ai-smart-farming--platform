import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from database import Base

class FarmerQuery(Base):
    __tablename__ = "farmer_queries"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )
    user_id = Column(
        String,
        index=True,
        nullable=True
    )
    query_text = Column(
        String,
        nullable=False
    )
    response_text = Column(
        String,
        nullable=True
    )
    status = Column(
        String,
        default="Pending"
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
