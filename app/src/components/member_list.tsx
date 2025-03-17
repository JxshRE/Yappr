import { useEffect, useState } from "react";
import { GetChannelMembers, Invite } from "../api/services/chat_service";
import { ChannelMember } from "../types/channel_member";
import { InviteMemberModal } from "./invite_member_modal";

interface props {
    channelId: string
}

export function ChannelMemberList({ channelId }: props) {
    const [members, setMembers] = useState<ChannelMember[]>([])
    const [toggle, setToggle] = useState(false)

    function getMembers() {
        GetChannelMembers(channelId).then(x => {
            setMembers(x.data);
        })
    }

    function toggleModal() {
        setToggle(true);
    }

    function hideModal(){
        setToggle(false);
    }

    function addMember(member: ChannelMember){
        setMembers([...members, member]);
    }

    useEffect(() => {
        getMembers();
    }, [channelId])

    return (
        <div className="w-[25em] h-full bg-secondary">
            {
                toggle ?
                    <InviteMemberModal hideModal={hideModal} addMember={addMember} channelId={channelId} /> : null
            }
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
                <div className="w-full h-15 bg-primary p-2 flex items-center rounded-lg cursor-pointer" onClick={toggleModal}>
                    <p className="text-xl w-full text-center">
                        Invite Member
                    </p>
                </div>
            </div>
        </div>
    )

}