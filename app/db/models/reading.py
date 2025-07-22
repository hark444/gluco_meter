from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.db.base import Base
from datetime import datetime


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    value = Column(Integer, nullable=False)
    source = Column(String, nullable=False)
    type = Column(String, nullable=False)
    remarks = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
