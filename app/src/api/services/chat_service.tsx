import { Channel } from "../../types/channel";
import { ChannelMember } from "../../types/channel_member";
import { Message } from "../../types/message";
import { apiClient } from "../axiosclient";


export function GetUserChannels(){
    return apiClient.get<Channel[]>('/chat/channels');
}

export function GetChannelHistory(channel: string, pageIndex: number, pageSize: number){
    return apiClient.get<Message[]>(`/chat/channels/${channel}/history/${pageIndex}/${pageSize}`)
}

export function GetChannelMembers(channel: string){
    return apiClient.get<ChannelMember[]>(`/chat/channel/${channel}/members`)
}

export function CreateChannel(channel_name: string){
    return apiClient.post<Channel>("/chat/channels/create", {channel_name})
}

export function Invite(channel_guid: string, member_name: string){
    return apiClient.post<ChannelMember>("/chat/channels/invite", {channel_guid, member_name})
}