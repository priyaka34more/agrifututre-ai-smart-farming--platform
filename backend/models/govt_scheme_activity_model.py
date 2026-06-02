import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from database import Base

class GovtSchemeActivity(Base):
    __tablename__ = "govt_scheme_activity"

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
    user_name = Column(
        String,
        nullable=True
    )
    scheme_name = Column(
        String,
        nullable=False
    )
    category = Column(
        String,
        nullable=False
    )
    action = Column(
        String,
        nullable=False
    )
    state = Column(
        String,
        nullable=True
    )
    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )
