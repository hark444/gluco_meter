from enum import Enum
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ReadingType(str, Enum):
    fasting = "fasting"
    random = "random"
    pp = "pp"


class ReadingCreate(BaseModel):
    value_ng_ml: int = Field(..., ge=0)
    reading_type: ReadingType
    created_at: Optional[datetime] = None
    notes: Optional[str] = None
    # Health metrics (optional)
    step_count: Optional[int] = Field(None, ge=0, description="Daily step count")
    sleep_hours: Optional[float] = Field(None, ge=0, le=24, description="Hours of sleep (0-24)")
    calorie_count: Optional[int] = Field(None, ge=0, description="Total calories consumed")
    protein_intake_g: Optional[float] = Field(None, ge=0, description="Protein intake in grams")
    carb_intake_g: Optional[float] = Field(None, ge=0, description="Carbohydrate intake in grams")
    exercise_minutes: Optional[int] = Field(None, ge=0, description="Exercise duration in minutes")


class ReadingUpdate(BaseModel):
    value_ng_ml: Optional[int] = Field(None, ge=0)
    reading_type: Optional[ReadingType] = None
    created_at: Optional[datetime] = None
    notes: Optional[str] = None
    # Health metrics (optional)
    step_count: Optional[int] = Field(None, ge=0, description="Daily step count")
    sleep_hours: Optional[float] = Field(None, ge=0, le=24, description="Hours of sleep (0-24)")
    calorie_count: Optional[int] = Field(None, ge=0, description="Total calories consumed")
    protein_intake_g: Optional[float] = Field(None, ge=0, description="Protein intake in grams")
    carb_intake_g: Optional[float] = Field(None, ge=0, description="Carbohydrate intake in grams")
    exercise_minutes: Optional[int] = Field(None, ge=0, description="Exercise duration in minutes")


class ReadingOut(BaseModel):
    id: int
    value_ng_ml: int
    reading_type: ReadingType
    created_at: datetime
    notes: Optional[str] = None
    # Health metrics (optional)
    step_count: Optional[int] = None
    sleep_hours: Optional[float] = None
    calorie_count: Optional[int] = None
    protein_intake_g: Optional[float] = None
    carb_intake_g: Optional[float] = None
    exercise_minutes: Optional[int] = None

    class Config:
        orm_mode = True


class PaginatedReadingOut(BaseModel):
    total: int
    page: int
    size: int
    readings: list[ReadingOut]
