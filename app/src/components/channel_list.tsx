import { useEffect, useState } from "react"
import { GetUserChannels } from "../api/services/chat_service"
import { Channel } from "../types/channel"
import { ProfileWidget } from "./profile_widget";
import { AddChannelModal } from "./add_channel_modal";

interface props {
    setChannelId: (val: any) => void;
}

export function ChannelList({ setChannelId }: props) {

    const [channels, setChannels] = useState<Channel[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [toggleAdd, setToggleAdd] = useState(false)
    const [refreshChannel, setRefreshChannel] = useState(true);

    function toggleAddChannel(){
        setToggleAdd(true);
    }

    useEffect(() => {
        if (refreshChannel){
            setRefreshChannel(false);
            GetUserChannels().then(x => {
                if (x.data) {
                    setChannels(x.data)
                }
            })
        }
    }, [refreshChannel])

    function addChannel(channel: Channel){
        setChannels([...channels, channel]);
    }

    function hideModal(){
        setToggleAdd(false);
    }

    return (
        <div className="flex flex-col w-full h-full p-2 gap-3">
            {
                toggleAdd ? 
                <AddChannelModal hideModal={hideModal} addChannel={addChannel} /> : null
            }
            <div className="w-full h-full flex flex-col gap-3">
                {
                    channels.map((x, i) => (
                        <div key={i} className="w-full h-20 bg-primary p-2 flex items-center rounded-lg cursor-pointer" onClick={() => setChannelId(x.guid)}>
                            <div className="w-15 h-full bg-secondary rounded-full mr-5"></div>
                            <p className="text-xl">
                                {x.name}
                            </p>
                        </div>
                    ))
                }
                
                <div className="w-full h-20 bg-primary p-2 flex items-center rounded-lg cursor-pointer" onClick={toggleAddChannel}>
                    <p className="text-xl w-full text-center">
                        Add Channel
                    </p>
                </div>
            </div>
            <ProfileWidget />
        </div>
    )
}