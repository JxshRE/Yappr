import { useState } from "react";
import { ChannelList } from "../components/channel_list";
import { Chat } from "../components/chat";

export function Home(){

    const [channelId, setChannelId] = useState<string | undefined>(undefined);

    return(
        <div className="w-full h-full flex flex-row gap-5">
            <div className="w-[25em] bg-secondary h-[100%] my-auto">
                <div className="flex flex-col h-80 w-full">
                    <ChannelList setChannelId={setChannelId} />
                </div>
                
            </div>
            {
                channelId ? 
                <div className="w-full h-full">
                    <Chat channelId={channelId} />
                </div>

                 : null
            }
        </div>
    )
}