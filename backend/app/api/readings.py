from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user, get_db
from app.db.models.reading import Reading
from app.db.models.user import User
from app.schemas.reading import (
    ReadingCreate,
    ReadingOut,
    ReadingUpdate,
    ReadingType,
    PaginatedReadingOut,
)


router = APIRouter()


@router.post("/readings", response_model=ReadingOut, status_code=status.HTTP_201_CREATED)
def create_reading(
    reading_in: ReadingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    created_at = reading_in.created_at or datetime.now(timezone.utc)
    reading = Reading(
        user_id=current_user.id,
        value_ng_ml=reading_in.value_ng_ml,
        reading_type=reading_in.reading_type.value,
        notes=reading_in.notes,
        created_at=created_at,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


@router.get("/readings", response_model=PaginatedReadingOut)
def list_readings(
    start: Optional[datetime] = Query(None, description="Start datetime inclusive"),
    end: Optional[datetime] = Query(None, description="End datetime inclusive"),
    reading_type: Optional[ReadingType] = Query(None),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Reading).filter(Reading.user_id == current_user.id)

    if start is not None:
        query = query.filter(Reading.created_at >= start)
    if end is not None:
        query = query.filter(Reading.created_at <= end)
    if reading_type is not None:
        query = query.filter(Reading.reading_type == reading_type.value)

    total = query.count()
    query = query.order_by(Reading.created_at.desc()).offset((page - 1) * size).limit(size)

    return PaginatedReadingOut(
        total=total,
        page=page,
        size=size,
        readings=query.all(),
    )


@router.get("/readings/{reading_id}", response_model=ReadingOut)
def get_reading_by_id(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reading = (
        db.query(Reading)
        .filter(Reading.id == reading_id, Reading.user_id == current_user.id)
        .first()
    )
    if reading is None:
        raise HTTPException(status_code=404, detail="Reading not found")
    return reading


@router.patch("/readings/{reading_id}", response_model=ReadingOut)
def update_reading(
    reading_id: int,
    reading_update: ReadingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reading = (
        db.query(Reading)
        .filter(Reading.id == reading_id, Reading.user_id == current_user.id)
        .first()
    )
    if reading is None:
        raise HTTPException(status_code=404, detail="Reading not found")

    if reading_update.value_ng_ml is not None:
        reading.value_ng_ml = reading_update.value_ng_ml
    if reading_update.reading_type is not None:
        reading.reading_type = reading_update.reading_type.value
    if reading_update.notes is not None:
        reading.notes = reading_update.notes

    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


@router.delete("/readings/{reading_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reading(
    reading_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reading = (
        db.query(Reading)
        .filter(Reading.id == reading_id, Reading.user_id == current_user.id)
        .first()
    )
    if reading is None:
        raise HTTPException(status_code=404, detail="Reading not found")

    db.delete(reading)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


