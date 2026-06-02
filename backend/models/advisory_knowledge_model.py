from sqlalchemy import Column, String
from database import Base

class AdvisoryKnowledge(Base):
    __tablename__ = "advisory_knowledge"

    disease_name = Column(
        String,
        primary_key=True,
        index=True
    )
    advisory_json = Column(
        String,
        nullable=False
    )
