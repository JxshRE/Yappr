import { apiClient } from "../axiosclient";
import { UserInfo } from "../../types/userInfo";

export function APILogin(username: string, password: string){
    return apiClient.post<UserInfo>('auth/login', {username, password}, {withCredentials: true});
}

export function GetUser(){
    return apiClient.get('auth/test');
}

export function APILogout(){
    return apiClient.post('auth/logout');
}