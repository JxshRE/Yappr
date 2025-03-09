import uuid
from datetime import timezone, datetime

import jwt
from fastapi import HTTPException
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import select, Session

from database.database import User
from settings import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserReduced(BaseModel):
    username: str
    guid: uuid.UUID

class UserRequest(BaseModel):
    username: str
    password: str

def get_user(username: str, session: Session):
    statement = select(User).where(User.username == username)
    return session.exec(statement).first()

def store_ref_token(session: Session, token: str, user: User):
    user.refresh_token = token
    session.add(user)
    session.commit()

def get_user_from_refresh(session: Session, token: str):
    statement = select(User).where(User.refresh_token == token)
    user = session.exec(statement).first()

    if not user:
        raise HTTPException(status_code=404, detail="Not found")

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=404, detail="Not found")
        expiry = datetime.fromtimestamp(payload.get("exp"), timezone.utc)

        if expiry < datetime.now(tz=timezone.utc):
            raise HTTPException(status_code=404, detail="Expired")

    except Exception:
        raise HTTPException(status_code=404, detail="Something went wrong")

    return user


def create_user(session: Session, req: UserRequest):
    password_hash = pwd_context.hash(req.password)
    new_user = User(username=req.username, hashed_password=password_hash, user_guid=uuid.uuid4())

    session.add(new_user)
    session.commit()

    return new_user
