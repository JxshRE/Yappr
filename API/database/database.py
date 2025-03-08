from uuid import UUID
from datetime import datetime, timezone

from fastapi import Depends
from sqlalchemy.sql.annotation import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select

from settings import settings


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_guid: UUID | None = Field(default=None)
    username: str
    hashed_password: str
    refresh_token: str
    created_at: datetime = Field(default=datetime.now(tz=timezone.utc))
    modified_at: datetime = Field(default=datetime.now(tz=timezone.utc))


class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    guid: UUID | None = Field(default=None)
    sender: int | None = Field(default=None, foreign_key="user.id")
    content: str
    channel_id: int = Field(default=None, foreign_key="channel.id")
    created_at: datetime = Field(default=datetime.now(tz=timezone.utc))
    modified_at: datetime = Field(default=datetime.now(tz=timezone.utc))

class Channel(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    guid: UUID | None = Field(default=None)
    disabled: bool | None = Field(default=False, primary_key=True)
    name: str | None
    created_at: datetime = Field(default=datetime.now(tz=timezone.utc))
    modified_at: datetime = Field(default=datetime.now(tz=timezone.utc))

class UserChannel(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    channel_id: int | None = Field(default=None, foreign_key="channel.id")
    user_id: int | None = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default=datetime.now(tz=timezone.utc))
    modified_at: datetime = Field(default=datetime.now(tz=timezone.utc))
    disabled: bool | None = Field(default=False, primary_key=True)


engine = create_engine(settings.DB_CONNECTION, echo=True)

def get_session():
    with Session(engine) as session:
        yield session
