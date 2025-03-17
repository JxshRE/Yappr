import { useRef, useState } from "react"
import { useForm } from "react-hook-form";
import { CreateChannel, Invite } from "../api/services/chat_service";
import { Channel } from "../types/channel";
import { ChannelMember } from "../types/channel_member";
import { AxiosError } from "axios";
import { ValidationException } from "../types/validation_exception";

interface props {
    addMember: (member: ChannelMember) => void;
    hideModal: () => void;
    channelId: string;
}

export function InviteMemberModal({ addMember, hideModal, channelId }: props) {

    const [maxNameLen, setMaxNameLen] = useState(25);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm();

    function submit(data: any) {
        if (data.username && data.username != '') {
            Invite(channelId, data.username).then(x => {
                if (x.data) {
                    addMember(x.data);
                    hideModal();
                }
            }).catch((err: AxiosError) => {
                if (err.status === 400) {
                    const msg = err.response?.data as ValidationException | undefined;
                    if (msg) {
                        setError("username", {
                            type: "value",
                            message: msg.detail
                        });
                    }
                }
            })
        }
    }

    return (
        <div className="w-full h-full absolute flex items-center justify-center left-0 top-0 bg-transparent">
            <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-black opacity-40 flex items-center">
            </div>
            <div className="w-[40em] p-5 border-secondary-border border-[2px] text-center absolute bg-secondary rounded-lg border-primary shadow-md h-[15em]">
                <h1 className="text-start text-lg m-0 p-0 font-bold text-foreground">Invite Member</h1>
                <form onSubmit={handleSubmit(submit)} className="w-full h-[90%] flex items-center flex-col justify-center">
                    <div className="w-full">
                        <div className={"w-full flex items-center flex-row bg-primary rounded-lg h-15 border-[1.5px] " + (errors.username ? " border-red-500 text-red-500" : " border-secondary-border text-foreground")}>
                            <span className="material-symbols-outlined w-10 select-none text-foreground">
                                person
                            </span>
                            <input {...register("username")} autoComplete="off" className="w-full h-full text-foreground outline-none" placeholder="Member Username" />
                        </div>
                        {errors.username && <p className="w-full text-left text-red-500 mt-1">{errors.username.message as string}</p>}
                    </div>

                    <div className="flex flex-row items-center w-full h-12 gap-2 mt-5">
                        <button className="cursor-pointer hover:bg-primary-accent w-full h-full bg-primary rounded-lg border-[2px] text-foreground border-secondary-border">Invite</button>
                        <button type="button" onClick={hideModal} className="cursor-pointer hover:bg-primary-accent w-full h-full bg-primary rounded-lg border-[2px] text-foreground border-secondary-border">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

    )
}