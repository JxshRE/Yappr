import { useCallback, useEffect, useRef, useState } from "react"
import useWebSocket from "react-use-websocket"
import { GetChannelHistory } from "../api/services/chat_service"
import { Message } from "../types/message"
import { useForm } from "react-hook-form"
import React from "react"

interface props {
    channelId: string
}

export function Chat({ channelId }: props) {

    const [socketUrl, setSocketUrl] = useState(`${import.meta.env.VITE_API_BASEURL_WEBSOCKET}/chat/channel/${channelId}`)
    const [messageHistory, setMessageHistory] = useState<Message[]>([])

    const chatWindowRef = useRef<HTMLDivElement | null>(null);
    const scrollToRef = useRef<HTMLDivElement | null>(null);
    const [disableAutoScroll, setDisableAutoScroll] = useState(false);

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

        GetChannelHistory(channelId).then(x => {
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
        GetChannelHistory(channelId).then(x => {
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
            scrollToRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messageHistory])


    return (
        <div className="w-full h-full bg-secondary p-3 flex flex-col">
            <p className="mb-2">Chat ID: {channelId}</p>
            <div ref={chatWindowRef} onScroll={handleAutoScroll} className="w-full h-full flex flex-col gap-3 flex-start overflow-y-scroll">
                {
                    messageHistory.map((x, i) => (
                        <div key={i} className="pl-3 w-full p-2 bg-primary flex flex-col rounded-lg h-max">
                            <p className="font-bold text-lg">{x.sender_name}</p>
                            <p className="text-foreground">{x.content}</p>
                        </div>
                    ))
                }
                <div className="mt-2" ref={scrollToRef}></div>
            </div>

            <div className="w-full h-15 bg-primary flex flex-row p-3">
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