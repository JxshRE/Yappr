import { apiClient } from "../axiosclient";
import { UserInfo } from "../../types/userInfo";
import { UserReduced } from "../../types/user";

export function APILogin(username: string, password: string){
    return apiClient.post<UserInfo>('auth/login', {username, password}, {withCredentials: true});
}

export function APIRegister(username: string, password: string){
    return apiClient.post<UserInfo>('auth/register', {username, password}, {withCredentials: true});
}


export function GetUser(){
    return apiClient.get<UserReduced>('auth/me');
}

export function APILogout(){
    return apiClient.post('auth/logout');
}