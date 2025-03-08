import { Channel } from "../../types/channel";
import { Message } from "../../types/message";
import { apiClient } from "../axiosclient";


export function GetUserChannels(){
    return apiClient.get<Channel[]>('/chat/channels');
}

export function GetChannelHistory(channel: string){
    return apiClient.get<Message[]>(`/chat/channels/${channel}/history`)
}