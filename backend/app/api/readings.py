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
        step_count=reading_in.step_count,
        sleep_hours=reading_in.sleep_hours,
        calorie_count=reading_in.calorie_count,
        protein_intake_g=reading_in.protein_intake_g,
        carb_intake_g=reading_in.carb_intake_g,
        exercise_minutes=reading_in.exercise_minutes,
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
    # Health metrics filtering
    min_step_count: Optional[int] = Query(None, ge=0, description="Minimum step count"),
    max_step_count: Optional[int] = Query(None, ge=0, description="Maximum step count"),
    min_sleep_hours: Optional[float] = Query(None, ge=0, le=24, description="Minimum sleep hours (0-24)"),
    max_sleep_hours: Optional[float] = Query(None, ge=0, le=24, description="Maximum sleep hours (0-24)"),
    min_calorie_count: Optional[int] = Query(None, ge=0, description="Minimum calorie count"),
    max_calorie_count: Optional[int] = Query(None, ge=0, description="Maximum calorie count"),
    min_protein_intake_g: Optional[float] = Query(None, ge=0, description="Minimum protein intake in grams"),
    max_protein_intake_g: Optional[float] = Query(None, ge=0, description="Maximum protein intake in grams"),
    min_carb_intake_g: Optional[float] = Query(None, ge=0, description="Minimum carb intake in grams"),
    max_carb_intake_g: Optional[float] = Query(None, ge=0, description="Maximum carb intake in grams"),
    min_exercise_minutes: Optional[int] = Query(None, ge=0, description="Minimum exercise minutes"),
    max_exercise_minutes: Optional[int] = Query(None, ge=0, description="Maximum exercise minutes"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(10, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Reading).filter(Reading.user_id == current_user.id)

    # Validate min/max ranges
    if min_step_count is not None and max_step_count is not None and min_step_count > max_step_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_step_count must be less than or equal to max_step_count"
        )
    if min_sleep_hours is not None and max_sleep_hours is not None and min_sleep_hours > max_sleep_hours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_sleep_hours must be less than or equal to max_sleep_hours"
        )
    if min_calorie_count is not None and max_calorie_count is not None and min_calorie_count > max_calorie_count:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_calorie_count must be less than or equal to max_calorie_count"
        )
    if min_protein_intake_g is not None and max_protein_intake_g is not None and min_protein_intake_g > max_protein_intake_g:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_protein_intake_g must be less than or equal to max_protein_intake_g"
        )
    if min_carb_intake_g is not None and max_carb_intake_g is not None and min_carb_intake_g > max_carb_intake_g:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_carb_intake_g must be less than or equal to max_carb_intake_g"
        )
    if min_exercise_minutes is not None and max_exercise_minutes is not None and min_exercise_minutes > max_exercise_minutes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="min_exercise_minutes must be less than or equal to max_exercise_minutes"
        )

    # Date range filtering
    if start is not None:
        query = query.filter(Reading.created_at >= start)
    if end is not None:
        query = query.filter(Reading.created_at <= end)
    if reading_type is not None:
        query = query.filter(Reading.reading_type == reading_type.value)

    # Health metrics filtering
    if min_step_count is not None:
        query = query.filter(Reading.step_count >= min_step_count)
    if max_step_count is not None:
        query = query.filter(Reading.step_count <= max_step_count)
    if min_sleep_hours is not None:
        query = query.filter(Reading.sleep_hours >= min_sleep_hours)
    if max_sleep_hours is not None:
        query = query.filter(Reading.sleep_hours <= max_sleep_hours)
    if min_calorie_count is not None:
        query = query.filter(Reading.calorie_count >= min_calorie_count)
    if max_calorie_count is not None:
        query = query.filter(Reading.calorie_count <= max_calorie_count)
    if min_protein_intake_g is not None:
        query = query.filter(Reading.protein_intake_g >= min_protein_intake_g)
    if max_protein_intake_g is not None:
        query = query.filter(Reading.protein_intake_g <= max_protein_intake_g)
    if min_carb_intake_g is not None:
        query = query.filter(Reading.carb_intake_g >= min_carb_intake_g)
    if max_carb_intake_g is not None:
        query = query.filter(Reading.carb_intake_g <= max_carb_intake_g)
    if min_exercise_minutes is not None:
        query = query.filter(Reading.exercise_minutes >= min_exercise_minutes)
    if max_exercise_minutes is not None:
        query = query.filter(Reading.exercise_minutes <= max_exercise_minutes)

    total = query.count()
    query = query.order_by(Reading.created_at.desc()).offset((page - 1) * size).limit(size)

    return dict(
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
    if reading_update.created_at is not None:
        reading.created_at = reading_update.created_at
    if reading_update.notes is not None:
        reading.notes = reading_update.notes
    # Update health metrics if provided
    if reading_update.step_count is not None:
        reading.step_count = reading_update.step_count
    if reading_update.sleep_hours is not None:
        reading.sleep_hours = reading_update.sleep_hours
    if reading_update.calorie_count is not None:
        reading.calorie_count = reading_update.calorie_count
    if reading_update.protein_intake_g is not None:
        reading.protein_intake_g = reading_update.protein_intake_g
    if reading_update.carb_intake_g is not None:
        reading.carb_intake_g = reading_update.carb_intake_g
    if reading_update.exercise_minutes is not None:
        reading.exercise_minutes = reading_update.exercise_minutes

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


