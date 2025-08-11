from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.db.base import Base
from datetime import datetime, timezone


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    value_ng_ml = Column(Integer, nullable=False)
    reading_type = Column(String, nullable=False)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
