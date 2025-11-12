"""add health metrics to readings

Revision ID: a1b2c3d4e5f6
Revises: 4b3a0c0a0c7a
Create Date: 2025-01-27 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, Sequence[str], None] = "4b3a0c0a0c7a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add health metrics columns to readings table.
    
    Adds the following optional columns:
    - step_count: Integer for daily step count
    - sleep_hours: Float for hours of sleep
    - calorie_count: Integer for total calories consumed
    - protein_intake_g: Float for protein intake in grams
    - carb_intake_g: Float for carbohydrate intake in grams
    - exercise_minutes: Integer for exercise duration in minutes
    """
    with op.batch_alter_table("readings", schema=None) as batch_op:
        batch_op.add_column(sa.Column("step_count", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("sleep_hours", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("calorie_count", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("protein_intake_g", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("carb_intake_g", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("exercise_minutes", sa.Integer(), nullable=True))


def downgrade() -> None:
    """Remove health metrics columns from readings table."""
    with op.batch_alter_table("readings", schema=None) as batch_op:
        batch_op.drop_column("exercise_minutes")
        batch_op.drop_column("carb_intake_g")
        batch_op.drop_column("protein_intake_g")
        batch_op.drop_column("calorie_count")
        batch_op.drop_column("sleep_hours")
        batch_op.drop_column("step_count")

