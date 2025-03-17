import { useRef, useState } from "react"
import { useForm } from "react-hook-form";
import { CreateChannel } from "../api/services/chat_service";
import { Channel } from "../types/channel";

interface props{
    addChannel: (channel: Channel) => void;
    hideModal: () => void;
}

export function AddChannelModal({ addChannel, hideModal }: props) {

    const [maxNameLen, setMaxNameLen] = useState(25);
    const [currentNameLen, setCurrentNameLen] = useState(0);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    function submit(data: any){
        if (data.channel_name && data.channel_name != ''){
            CreateChannel(data.channel_name).then(x => {
                addChannel(x.data);
                hideModal();
            });
        }
    }

    return (
        <div className="w-full h-full absolute flex items-center justify-center left-0 top-0 bg-transparent">
            <div className="absolute top-0 left-0 w-[100vw] h-[100vh] bg-black opacity-40 flex items-center">
            </div>
            <div className="w-[40em] p-5 border-secondary-border border-[2px] text-center absolute bg-secondary rounded-lg border-primary shadow-md h-[15em]">
                <h1 className="text-start text-lg m-0 p-0 font-bold text-foreground">Create Channel</h1>
                <form onSubmit={handleSubmit(submit)} className="w-full h-[90%] flex items-center flex-col justify-center gap-5">
                    <div className="w-full flex items-center flex-row bg-primary rounded-lg h-15 border-[2px] border-secondary-border">
                        <span className="material-symbols-outlined w-10 select-none text-foreground">
                            edit
                        </span>
                        <input autoComplete="off" {...register("channel_name")} onChange={(e) => setCurrentNameLen(e.target.value.length)} maxLength={maxNameLen} className="w-full h-full text-foreground outline-none" placeholder="Channel Name" />
                        <p className="absolute pointer-events-none self-end text-end w-[92%] text-foreground">{`${currentNameLen}/${maxNameLen}`}</p>
                    </div>
                    <div className="flex flex-row items-center w-full h-12 gap-2">
                        <button className="cursor-pointer hover:bg-primary-accent w-full h-full bg-primary rounded-lg border-[2px] text-foreground border-secondary-border">Create Channel</button>
                        <button type="button" onClick={hideModal} className="cursor-pointer hover:bg-primary-accent w-full h-full bg-primary rounded-lg border-[2px] text-foreground border-secondary-border">Cancel</button>
                    </div>
                </form>
            </div>
        </div>

    )
}