import { Outlet } from "react-router-dom";


export function Layout(){
    return (
        <div className="w-[100vw] h-[100vh] font-poppins bg-primary text-white p-5">
            <Outlet />
        </div>
    )
}