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


class ReadingUpdate(BaseModel):
    value_ng_ml: Optional[int] = Field(None, ge=0)
    reading_type: Optional[ReadingType] = None
    notes: Optional[str] = None


class ReadingOut(BaseModel):
    id: int
    value_ng_ml: int
    reading_type: ReadingType
    created_at: datetime
    notes: Optional[str] = None

    class Config:
        orm_mode = True


class PaginatedReadingOut(BaseModel):
    total: int
    page: int
    size: int
    readings: list[ReadingOut]
