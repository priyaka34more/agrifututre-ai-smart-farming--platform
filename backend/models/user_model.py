from sqlalchemy import Column, String, Boolean
from database import Base

class User(Base):

    __tablename__ = "users"

    id = Column(
        String,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=True
    )

    mobile = Column(
        String,
        unique=True,
        index=True,
        nullable=True
    )

    hashed_password = Column(
        String,
        nullable=True
    )

    full_name = Column(String)

    is_active = Column(
        Boolean,
        default=True
    )

    role = Column(
        String,
        default="user"
    )

    google_id = Column(
        String,
        unique=True,
        index=True,
        nullable=True
    )

    reset_token = Column(
        String,
        nullable=True
    )