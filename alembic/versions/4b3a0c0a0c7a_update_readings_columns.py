"""update readings columns to new schema

Revision ID: 4b3a0c0a0c7a
Revises: e9fc8874ef77
Create Date: 2025-08-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4b3a0c0a0c7a"
down_revision: Union[str, Sequence[str], None] = "e9fc8874ef77"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to new readings fields.

    - Add value_ng_ml, reading_type, notes, created_at
    - Copy data from legacy columns
    - Drop legacy columns: value, source, type, remarks, timestamp
    """
    with op.batch_alter_table("readings", schema=None) as batch_op:
        batch_op.add_column(sa.Column("value_ng_ml", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("reading_type", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("notes", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("created_at", sa.DateTime(timezone=True), nullable=True))

    # Backfill data from old columns if they exist
    op.execute(
        "UPDATE readings SET value_ng_ml = value WHERE value_ng_ml IS NULL"
    )
    op.execute(
        "UPDATE readings SET reading_type = type WHERE reading_type IS NULL"
    )
    op.execute(
        "UPDATE readings SET notes = remarks WHERE notes IS NULL"
    )
    op.execute(
        "UPDATE readings SET created_at = timestamp WHERE created_at IS NULL"
    )

    with op.batch_alter_table("readings", schema=None) as batch_op:
        # Drop legacy columns if present
        try:
            batch_op.drop_column("value")
        except Exception:
            pass
        try:
            batch_op.drop_column("source")
        except Exception:
            pass
        try:
            batch_op.drop_column("type")
        except Exception:
            pass
        try:
            batch_op.drop_column("remarks")
        except Exception:
            pass
        try:
            batch_op.drop_column("timestamp")
        except Exception:
            pass


def downgrade() -> None:
    """Recreate legacy columns and move data back, then drop new columns."""
    with op.batch_alter_table("readings", schema=None) as batch_op:
        batch_op.add_column(sa.Column("value", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("source", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("type", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("remarks", sa.String(), nullable=True))
        batch_op.add_column(sa.Column("timestamp", sa.DateTime(), nullable=True))

    op.execute("UPDATE readings SET value = value_ng_ml WHERE value IS NULL")
    op.execute(
        "UPDATE readings SET type = reading_type WHERE type IS NULL"
    )
    op.execute("UPDATE readings SET remarks = notes WHERE remarks IS NULL")
    op.execute(
        "UPDATE readings SET timestamp = created_at WHERE timestamp IS NULL"
    )

    with op.batch_alter_table("readings", schema=None) as batch_op:
        try:
            batch_op.drop_column("value_ng_ml")
        except Exception:
            pass
        try:
            batch_op.drop_column("reading_type")
        except Exception:
            pass
        try:
            batch_op.drop_column("notes")
        except Exception:
            pass
        try:
            batch_op.drop_column("created_at")
        except Exception:
            pass


