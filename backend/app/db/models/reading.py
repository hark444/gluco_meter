from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
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
    
    # Health metrics (optional)
    step_count = Column(Integer, nullable=True)
    sleep_hours = Column(Float, nullable=True)
    calorie_count = Column(Integer, nullable=True)
    protein_intake_g = Column(Float, nullable=True)
    carb_intake_g = Column(Float, nullable=True)
    exercise_minutes = Column(Integer, nullable=True)
