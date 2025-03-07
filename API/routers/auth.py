import uuid
from datetime import timedelta, datetime, timezone

import jwt
from fastapi import APIRouter, HTTPException, Response, Request, Depends, Cookie
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlmodel import select, Session
from starlette import status
from typing_extensions import Optional

from database.database import User, get_session, UserChannel, Channel
from settings import settings


class UserRequest(BaseModel):
    username: str
    password: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/refresh")

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

class AuthResponse(BaseModel):
    access_expiry: datetime
    username: str

def get_user_channel(user: User, channel_id: str, session: Session) -> Channel:
    statement = select(UserChannel, Channel).join(Channel).where(UserChannel.user_id == user.id and str(Channel.guid) == channel_id)
    res = session.exec(statement)
    for uChannel, channel in res:
        return channel

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user(username: str, session: Session):
    statement = select(User).where(User.username == username)
    return session.exec(statement).first()

def auth_user(session: Session, username: str, password: str):
    user = get_user(username, session)
    if not user or not verify_password(password, user.hashed_password):
        return None

    return user

def create_access_token(data: dict, expiry: Optional[datetime] = None):
    to_encode = data.copy()
    if expiry:
        expire = expiry
    else:
        expire = datetime.now(tz=timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def store_ref_token(session: Session, token: str, user: User):
    user.refresh_token = token
    session.add(user)
    session.commit()

def create_refresh_token(session: Session, data: dict, user: User):
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})

    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    store_ref_token(session, token, user)
    return token

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

def set_response_tokens(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=15 * 60,
        expires=15 * 60,
        secure=True,  # Set to False for local development without HTTPS
        samesite="strict"
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=7 * 24 * 60 * 60,
        expires=7 * 24 * 60 * 60,
        secure=True,  # Set to False for local development without HTTPS
        samesite="strict"
    )

async def get_current_user(request: Request, session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise credentials_exception
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except:
        raise credentials_exception

    user = get_user(username, session)
    if user is None:
        raise credentials_exception

    return user


@router.post("/register")
async def register(req: UserRequest, response: Response, session: Session = Depends(get_session)) -> AuthResponse:
    user = get_user(req.username, session)
    if user is not None:
        raise HTTPException(status_code=400, detail="Username already registered")

    user = create_user(session, req)
    expiry = datetime.now(tz=timezone.utc) + timedelta(minutes=15)

    access_token = create_access_token(data={"sub": user.username}, expiry=expiry)
    refresh_token = create_refresh_token(session, {"sub": user.username}, user)

    set_response_tokens(response, access_token, refresh_token)

    return AuthResponse(access_expiry=expiry, username=user.username)

@router.post("/login")
async def login(req: UserRequest, response: Response, session: Session = Depends(get_session)) -> AuthResponse:
    user = auth_user(session, req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    expiry = datetime.now(tz=timezone.utc) + timedelta(minutes=15)

    access_token = create_access_token(data={"sub": user.username}, expiry=expiry)
    refresh_token = create_refresh_token(session, {"sub": user.username}, user)

    set_response_tokens(response, access_token, refresh_token)

    return AuthResponse(access_expiry=expiry, username=user.username)

@router.get("/refresh")
async def refresh(req: Request, response: Response, session: Session = Depends(get_session)):
    ref_token = req.cookies.get("refresh_token")
    if not ref_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = get_user_from_refresh(session, ref_token)

    expiry = datetime.now(tz=timezone.utc) + timedelta(minutes=15)

    access_token = create_access_token(data={"sub": user.username}, expiry=expiry)
    refresh_token = create_refresh_token(session, {"sub": user.username}, user)

    set_response_tokens(response, access_token, refresh_token)

    return AuthResponse(access_expiry=expiry, username=user.username)


@router.get('/test')
async def test(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    return {f"You are authed {user.username}"}