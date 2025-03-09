import { useCallback, useEffect, useRef, useState } from "react"
import useWebSocket from "react-use-websocket"
import { GetChannelHistory, GetChannelMembers } from "../api/services/chat_service"
import { Message } from "../types/message"
import { useForm } from "react-hook-form"
import React from "react"
import { ChannelMember } from "../types/channel_member"
import dayjs from "dayjs"

interface props {
    channelId: string
}

export function Chat({ channelId }: props) {

    const [socketUrl, setSocketUrl] = useState(`${import.meta.env.VITE_API_BASEURL_WEBSOCKET}/chat/channel/${channelId}`)
    const [messageHistory, setMessageHistory] = useState<Message[]>([])

    const chatWindowRef = useRef<HTMLDivElement | null>(null);
    const scrollToRef = useRef<HTMLDivElement | null>(null);
    const [disableAutoScroll, setDisableAutoScroll] = useState(false);
    const [ pageIndex, setPageIndex ] = useState(0);
    const [ pageSize, setPageSize ] = useState(10);
    const [ reachedMaxHistory, setReachedMaxHistory ] = useState(false);
    const [ initialLoaded, setInitialLoaded ] = useState(false)

    const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(socketUrl)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.addEventListener('scroll', handleAutoScroll);
        }

        GetChannelHistory(channelId, pageIndex, pageSize).then(x => {
            if (x.data) {
                setMessageHistory(x.data)
            }
        })        
    }, [])

    useEffect(() => {
        reset_component()
    }, [channelId])

    function reset_component() {
        setMessageHistory([])
        setSocketUrl(`${import.meta.env.VITE_API_BASEURL_WEBSOCKET}/chat/channel/${channelId}`)
        setPageIndex(0);
        setReachedMaxHistory(false);
        setInitialLoaded(false);
        setDisableAutoScroll(false);
        GetChannelHistory(channelId, 0, pageSize).then(x => {
            if (x.data) {
                setMessageHistory(x.data)
            }
        })
    }

    useEffect(() => {
        if (lastMessage !== null) {
            const initial = JSON.parse(lastMessage.data);
            const msg: Message = JSON.parse(initial);
            setMessageHistory((prev) => prev.concat(msg));
        }
    }, [lastMessage])


    function handleAutoScroll() {
        if (!chatWindowRef.current)
            return;

        const { scrollTop, scrollHeight, clientHeight } = chatWindowRef.current

        if (scrollTop === 0 && initialLoaded){
            // load more messages
            let newPageIndex = pageIndex + 1;
            setPageIndex(newPageIndex);
            if (!reachedMaxHistory){
                GetChannelHistory(channelId, newPageIndex, pageSize).then(x => {
                    if (x.data) {
                        if (x.data.length === 0){
                            setReachedMaxHistory(true);
                        }
                        
                        setDisableAutoScroll(true)
                        setMessageHistory((prev)=>[...x.data, ...prev]);

                        chatWindowRef.current!.scrollTop = clientHeight
                    }
                })
            }
        }

        if (scrollTop + clientHeight < scrollHeight) {
            setDisableAutoScroll(true)
        } else {
            setDisableAutoScroll(false);
        }

    }

    function sendMsg(data: any) {

        const msg = data.message;

        if (msg.length === 0)
            return;

        sendMessage(msg)
        reset()
    }

    useEffect(() => {
        if (scrollToRef.current && !disableAutoScroll) {
            if (initialLoaded){
                scrollToRef.current.scrollIntoView({ behavior: 'smooth' })
            }else{
                scrollToRef.current.scrollIntoView({ behavior: 'instant' })
                setInitialLoaded(true);
            }
            
        }
    }, [messageHistory])

    function formatDate(date: Date){
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    }

    return (
        <div className="w-full h-full bg-secondary p-3 flex flex-col">
            <p className="mb-2">Chat ID: {channelId}</p>
            <div ref={chatWindowRef} onScroll={handleAutoScroll} className="w-full h-full flex flex-col gap-3 flex-start overflow-y-scroll">
                {
                    messageHistory.map((x, i) => (
                        <div key={i} className="pl-3 w-full p-2 bg-primary flex flex-col rounded-lg h-max">
                            <span className="text-sm text-foreground font-normal">{formatDate(x.created_at)}</span>
                            <p className="font-bold text-lg w-full pb-2">{x.sender_name}</p>
                            <p className="text-foreground">{x.content}</p>
                        </div>  
                    ))
                }
                <div className="mt-2" ref={scrollToRef}></div>
            </div>

            <div className="w-full h-15 bg-primary flex flex-row p-3 rounded-lg">
                <form className="flex flex-row w-full" onSubmit={handleSubmit(sendMsg)}>
                    <input autoComplete="off" type="text" placeholder="Enter message" className="w-[98%] text-foreground h-full bg-transparent outline-none" {...register('message')} />
                    <button type="submit" className="self-end justify-self-end text-foreground cursor-pointer"><span className="material-symbols-outlined">
                        send
                    </span></button>
                </form>
            </div>
        </div>
    )
}