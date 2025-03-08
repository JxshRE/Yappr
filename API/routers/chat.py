import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import UUID4, BaseModel
from sqlmodel import Session
from starlette.websockets import WebSocket, WebSocketDisconnect
from sqlmodel import select, Session
from database.database import User, get_session, Message, UserChannel, Channel
from routers.auth import get_current_user, get_user_channel, get_current_user_websocket

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

connected_clients: Dict[str, list[WebSocket]] = {}

class ChannelReduced(BaseModel):
    name: str
    guid: uuid.UUID

class MessageWeb(BaseModel):
    content: str
    sender_name: str
    sender_guid: uuid.UUID

async def add_msg_to_history(content: str, channel_id: int, user: User, session: Session):
    message = Message(content=content, sender=user.id, guid=uuid.uuid4(), channel_id=channel_id)
    session.add(message)
    session.commit()

def get_user_channels_from_db(user: User, session: Session):
    statement = select(UserChannel, Channel).join(Channel).where(UserChannel.user_id == user.id)
    results = session.exec(statement)
    channels = []
    for uChannel, channel in results:
        channels.append(ChannelReduced(name=channel.name or '', guid=channel.guid))

    return channels

def get_message_history(session: Session, channel_id: uuid.UUID, user: User):
    statement = (select(Message, Channel, UserChannel, User)
    .join(Channel, Channel.id == Message.channel_id)
    .join(UserChannel, UserChannel.channel_id == Channel.id)
    .join(User, User.id == Message.sender)
    .where((UserChannel.user_id == user.id) & (Channel.guid == channel_id)))

    results = session.exec(statement)
    messages = []
    for msg, channel, uChannel, usr in results:
        messages.append(MessageWeb(sender_name=usr.username, sender_guid=usr.user_guid, content=msg.content))

    return messages

@router.get("/channels/{channel_id}/history", response_model=List[MessageWeb])
async def get_message_history_for_channel(channel_id: uuid.UUID, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    res = get_message_history(session, channel_id, user)
    return res
@router.get("/channels", response_model=List[ChannelReduced])
async def get_user_channels(user: User = Depends(get_current_user), session: Session = Depends(get_session)):
    res = get_user_channels_from_db(user, session)
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
                    await client.send_json(MessageWeb(content=message, sender_name=user.username, sender_guid=user.user_guid).model_dump_json())

    except WebSocketDisconnect:
        if channel_id in connected_clients and websocket in connected_clients[channel_id]:
            connected_clients[channel_id].remove(websocket)
            if not connected_clients[channel_id]:
                del connected_clients[channel_id]

    except Exception as exc:
        print(f"Error occured: {exc}")


