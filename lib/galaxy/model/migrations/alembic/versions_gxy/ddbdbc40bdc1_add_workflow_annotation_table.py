"""add workflow_annotation table

Revision ID: ddbdbc40bdc1
Revises: 987ce9839ecb
Create Date: 2023-08-14 13:41:59.442243

"""
import sqlalchemy as sa

from galaxy.model.custom_types import (
    JSONType,
    MutableJSONType,
)
from galaxy.model.migrations.util import (
    create_table,
    drop_table,
    transaction,
)

# revision identifiers, used by Alembic.
revision = "ddbdbc40bdc1"
down_revision = "987ce9839ecb"
branch_labels = None
depends_on = None

WORKFLOW_ANNOTATION_TABLE_NAME = "workflow_annotation"


def upgrade():
    with transaction():
        create_table(
            WORKFLOW_ANNOTATION_TABLE_NAME,
            sa.Column("id", sa.Integer, primary_key=True),
            sa.Column("workflow_id", sa.Integer, sa.ForeignKey("workflow_step.id")),
            sa.Column("position", MutableJSONType),
            sa.Column("size", JSONType),
            sa.Column("type", sa.String(16)),
            sa.Column("colour", sa.String(16)),
            sa.Column("data", JSONType),
        )


def downgrade():
    with transaction():
        drop_table(WORKFLOW_ANNOTATION_TABLE_NAME)
