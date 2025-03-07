import uuid
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException
from pydantic import UUID4
from sqlmodel import Session
from starlette.websockets import WebSocket, WebSocketDisconnect

from database.database import User, get_session, Message
from routers.auth import get_current_user, get_user_channel

router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)

connected_clients: Dict[str, list[WebSocket]] = {}

async def add_msg_to_history(content: str, channel_id: int, user: User, session: Session):
    message = Message(content=content, sender=user.id, guid=uuid.uuid4(), channel_id=channel_id)
    session.add(message)
    session.commit()

@router.websocket("/channel/{channel_id}")
async def websocket_channel(websocket: WebSocket, channel_id: str, user: User = Depends(get_current_user), session: Session = Depends(get_session)):
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
                for client in connected_clients[channel_id]:
                    if client != websocket:
                        await add_msg_to_history(message, channel.id, user, session)
                        await client.send_text(message)

    except WebSocketDisconnect:
        if channel_id in connected_clients and websocket in connected_clients[channel_id]:
            connected_clients[channel_id].remove(websocket)
            if not connected_clients[channel_id]:
                del connected_clients[channel_id]

    except Exception as exc:
        print(f"Error occured: {exc}")


