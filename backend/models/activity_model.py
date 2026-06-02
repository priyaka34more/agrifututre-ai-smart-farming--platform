import uuid

from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    DateTime,
    JSON
)

from database import Base

# =====================================================
# USER ACTIVITY MODEL
# =====================================================

class UserActivity(Base):

    __tablename__ = "user_activities"

    # =================================================
    # PRIMARY ID
    # =================================================

    id = Column(

        String,

        primary_key=True,

        default=lambda: str(uuid.uuid4()),

        index=True
    )

    # =================================================
    # USER INFO
    # =================================================

    user_id = Column(

        String,

        nullable=True,

        index=True
    )

    # =================================================
    # MODULE
    # =================================================

    module = Column(

        String,

        nullable=False
    )

    # =================================================
    # ACTION
    # =================================================

    action = Column(

        String,

        nullable=False
    )

    # =================================================
    # RESULT
    # =================================================

    result = Column(

        String,

        nullable=False
    )

    # =================================================
    # EXTRA JSON DATA
    # =================================================

    extra_data = Column(

        JSON,

        nullable=True
    )

    # =================================================
    # TIMESTAMP
    # =================================================

    created_at = Column(

        DateTime,

        default=datetime.utcnow
    )