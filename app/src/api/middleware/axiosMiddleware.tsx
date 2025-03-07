import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { apiClient } from "../axiosclient";

export function getRefreshToken(){
    console.log('call refresh')
    return apiClient.get("/auth/refresh", {withCredentials: true});
}

export const useAxiosInterceptors = () => {
    const navigate = useNavigate();
    useEffect(()=>{   
        const resInterceptor = axios.interceptors.response.use((res)=>{
            return res;
        }, (err) => {
            if (err.response.status === 401){
                localStorage.removeItem('user');
                navigate("/login", {replace: true});
                return Promise.reject(err);
            }
            return Promise.reject(err);
        })

        return ()=>{
            axios.interceptors.response.eject(resInterceptor);
        }
    }, []);

}
