import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import UUID4, BaseModel
from sqlmodel import Session
from starlette.websockets import WebSocket, WebSocketDisconnect
from sqlmodel import select, Session

from database.chat_repo import get_user_channel, get_message_history, get_user_channels_from_db, ChannelReduced, \
    MessageWeb, add_msg_to_history, get_channel_members, db_create_channel, db_add_member_to_channel
from database.database import User, get_session, Message, UserChannel, Channel
from routers.auth import get_current_user, get_current_user_websocket

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

class ChannelRequest(BaseModel):
    channel_name: str

class InviteRequest(BaseModel):
    channel_guid: uuid.UUID
    member_name: str

connected_clients: Dict[str, list[WebSocket]] = {}

generic_unauthed_exc = HTTPException(status_code=401, detail="Unauthorized")

@router.get("/channels/{channel_id}/history/{pageIndex}/{pageSize}", response_model=List[MessageWeb])
async def get_message_history_for_channel(channel_id: uuid.UUID, pageIndex: int, pageSize: int, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    res = get_message_history(session, channel_id, user, pageIndex, pageSize)
    return res
@router.get("/channels", response_model=List[ChannelReduced])
async def get_user_channels(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    res = get_user_channels_from_db(user, session)
    return res

@router.post("/channels/invite")
async def invite(req: InviteRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session) ):
    res = db_add_member_to_channel(user, req.channel_guid, req.member_name, session)
    return res

@router.post("/channels/create", response_model=ChannelReduced)
async def create_channel(req: ChannelRequest, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    res = db_create_channel(user, req.channel_name, session)
    return res

@router.get("/channel/{channel_id}/members")
async def get_channel_users(channel_id: uuid.UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    if (user is None):
        raise generic_unauthed_exc

    res = get_channel_members(user, session, channel_id)
    return res

@router.websocket("/channel/{channel_id}")
async def websocket_channel(websocket: WebSocket, channel_id: uuid.UUID, user: User or None = Depends(get_current_user_websocket), session: Session = Depends(get_session)):
    if user is None:
        await websocket.close(code=401, reason="Unauthorized")
        return

    channel = get_user_channel(user, channel_id, session)

    if channel is None:
        await websocket.close(code=404, reason="Channel not found")
        return

    await websocket.accept()

    if channel_id not in connected_clients:
        connected_clients[channel_id] = []

    connected_clients[channel_id].append(websocket)
    try:
        while True:
            message = await websocket.receive_text()
            if channel_id in connected_clients:
                await add_msg_to_history(message, channel.id, user, session)
                for client in connected_clients[channel_id]:
                    await client.send_json(MessageWeb(content=message, sender_name=user.username, sender_guid=user.user_guid, created_at=datetime.now(tz=timezone.utc)).model_dump_json())

    except WebSocketDisconnect:
        if channel_id in connected_clients and websocket in connected_clients[channel_id]:
            connected_clients[channel_id].remove(websocket)
            if not connected_clients[channel_id]:
                del connected_clients[channel_id]

    except Exception as exc:
        print(f"Error occured: {exc}")


