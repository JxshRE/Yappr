import { Navigate, Outlet } from "react-router-dom";
import { getRefreshToken, useAxiosInterceptors } from "../api/middleware/axiosMiddleware";
import { useEffect, useState } from "react";

export function PrivateRoutes(){
    const axiosMiddleware = useAxiosInterceptors();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(()=>{
        const user = localStorage.getItem("user");
        setIsLoading(true);
        if (user){
            const json = JSON.parse(user);
            if (new Date(json.access_expiry).getTime() > (new Date()).getTime()){
                setIsAuthenticated(true);
                setIsLoading(false);
            }else{
                getRefreshToken().then((x)=>{
                    localStorage.setItem('user', JSON.stringify(x.data));
                    setIsAuthenticated(true);
                }).catch(()=>{
                    console.log('erorr')
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setIsLoading(false);
                })
                .finally(()=>{
                    setIsLoading(false)
                });
            }
        }else{
            setIsLoading(false);
        }
    }, [])

    if (isLoading){
        return <div className="w-[100vw] h-[100vh] bg-primary"></div>
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export function PublicRoutes(){
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(()=>{
        const user = localStorage.getItem("user");
        if (user){
            const json = JSON.parse(user);
            if (json){
                setIsAuthenticated(true);
                setIsLoading(false);
            }
        }else{
            setIsLoading(false);
        }
    }, [])

    if (isLoading){
        return <div className="w-[100vw] h-[100vh] bg-primary"></div>
    }

    return isAuthenticated ? <Navigate to="/home" /> : <Outlet />
}