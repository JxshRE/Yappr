import { useEffect, useState } from "react"
import { GetUserChannels } from "../api/services/chat_service"
import { Channel } from "../types/channel"

interface props{
    setChannelId: (val: any) => void;
}

export function ChannelList({ setChannelId }: props){

    const [channels, setChannels] = useState<Channel[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(()=>{
        GetUserChannels().then(x => {
            if (x.data){
                setChannels(x.data)
            }
        })
    }, [])

    return (
        <div className="flex flex-col w-full h-full p-2 gap-3">
            {
                channels.map((x,i) => (
                    <div key={i} className="w-full h-20 bg-primary p-2 flex items-center rounded-lg cursor-pointer" onClick={() => setChannelId(x.guid)}>
                        <div className="w-15 h-full bg-secondary rounded-full mr-5"></div>
                        <p className="text-xl">
                            {x.name}
                        </p>
                    </div>
                ))
            }
        </div>
    )
}