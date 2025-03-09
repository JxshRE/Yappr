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