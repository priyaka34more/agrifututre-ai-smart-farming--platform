from sqlalchemy import Column, String, Boolean, DateTime, Integer
from datetime import datetime
from database import Base

class AdminNews(Base):
    __tablename__ = "admin_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    image = Column(String)
    source = Column(String, default="AgriFuture Admin")
    is_pinned = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
