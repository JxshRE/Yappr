import { useEffect, useState } from "react";
import { GetChannelMembers } from "../api/services/chat_service";
import { ChannelMember } from "../types/channel_member";

interface props{
    channelId: string
}

export function ChannelMemberList({ channelId }: props) {
    const [members, setMembers] = useState<ChannelMember[]>([])

    function getMembers() {
        GetChannelMembers(channelId).then(x => {
            setMembers(x.data);
        })
    }

    useEffect(()=>{
        getMembers();
    }, [channelId])

    return(
        <div className="w-[25em] h-full bg-secondary">
            <div className="w-full h-full p-2 gap-3 flex flex-col">
                {
                    members.map((member, i) => (
                        <div key={`member:${i}`} className="w-full h-15 rounded-lg bg-primary">
                            <div className="flex items-center flex-row gap-3 w-full h-full p-2">
                                <div className="h-full w-12 bg-secondary rounded-full"></div>
                                <div className="w-full h-full flex items-center">
                                    <p className="text-lg">{member.username}</p>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )

}