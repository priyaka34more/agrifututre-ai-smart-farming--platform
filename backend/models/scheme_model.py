from sqlalchemy import Column, String, Text
from database import Base

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    state = Column(String, default="All")
    category = Column(String)
    status = Column(String) # 'Ongoing', 'Upcoming', 'New'
    description = Column(Text)
    benefits = Column(Text)
    eligibility = Column(Text)
    link = Column(String)
