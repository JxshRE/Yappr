import { useEffect, useState } from "react";
import { GetUser } from "../api/services/authService";
import { UserReduced } from "../types/user";


export function ProfileWidget(){

    const [user, setUser] = useState<UserReduced|undefined>(undefined)

    useEffect(()=>{
        GetUser().then(x => {
            setUser(x.data);
        })
    }, [])

    return (
        <div className="flex flex-row gap-3 w-full h-20 bg-primary p-2 rounded-full">
            <img className="bg-secondary w-16 h-full border-[3px] border-secondary rounded-full" src="yappr_logo.png" />
            <div className="w-full h-full flex flex-col">
                <div className="flex flex-col items-center h-full">
                    <p className="text-xl w-full mt-2">{user?.username}</p>
                    <p className="text-sm w-full text-foreground">Online</p>
                </div>
            </div>
        </div>
    )

}