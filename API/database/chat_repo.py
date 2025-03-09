import uuid
from datetime import datetime, timezone

from pydantic import BaseModel
from sqlmodel import select, Session

from database.database import UserChannel, Channel, User, Message

class MemberReduced(BaseModel):
    username: str
    user_id: uuid.UUID

class ChannelReduced(BaseModel):
    name: str
    guid: uuid.UUID

class MessageWeb(BaseModel):
    content: str
    sender_name: str
    sender_guid: uuid.UUID
    created_at: datetime

def get_user_channel(user: User, channel_id: uuid.UUID, session: Session) -> Channel:
    statement = select(UserChannel, Channel).join(Channel, UserChannel.channel_id == Channel.id).where((UserChannel.user_id == user.id) & (Channel.guid == channel_id))
    res = session.exec(statement)
    for uChannel, channel in res:
        return channel


async def add_msg_to_history(content: str, channel_id: int, user: User, session: Session):
    message = Message(content=content, sender=user.id, guid=uuid.uuid4(), channel_id=channel_id, created_at=datetime.now(tz=timezone.utc), modified_at=datetime.now(tz=timezone.utc))
    session.add(message)
    session.commit()

def get_user_channels_from_db(user: User, session: Session):
    statement = select(UserChannel, Channel).join(Channel).where(UserChannel.user_id == user.id)
    results = session.exec(statement)
    channels = []
    for uChannel, channel in results:
        channels.append(ChannelReduced(name=channel.name or '', guid=channel.guid))

    return channels

def get_channel_members(user: User, session: Session, channel_id: uuid.UUID):
    statement = select(UserChannel, Channel, User).join(Channel, Channel.id == UserChannel.channel_id).join(User, User.id == UserChannel.user_id).where((Channel.guid == channel_id) and (UserChannel.user_id == user.id))
    results = session.exec(statement)

    members = []
    for (uChannel, channel, member) in results:
        members.append(MemberReduced(username=member.username, user_id=member.user_guid))

    return members

def get_message_history(session: Session, channel_id: uuid.UUID, user: User, pageIndex: int, pageSize: int):
    statement = (select(Message, Channel, UserChannel, User)
        .order_by(Message.created_at.desc())
        .join(Channel, Channel.id == Message.channel_id)
        .join(UserChannel, UserChannel.channel_id == Channel.id)
        .join(User, User.id == Message.sender)
        .where((UserChannel.user_id == user.id) & (Channel.guid == channel_id))
        .offset(pageIndex*pageSize)
        .limit(pageSize)
    )


    results = session.exec(statement)
    messages = []
    for msg, channel, uChannel, usr in results:
        messages.append(MessageWeb(sender_name=usr.username, sender_guid=usr.user_guid, content=msg.content, created_at=msg.created_at))

    return sorted(messages, key=lambda m: m.created_at)