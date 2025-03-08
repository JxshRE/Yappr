import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { APILogin, APIRegister } from "../api/services/authService";

export function Login({ isRegister = false }) {

    const [isLoading, setIsLoading] = useState(false);

    const nav = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    function submitLogin(data: any){
        const username = data.username;
        const password = data.password;
        setIsLoading(true);
        APILogin(username, password).then(x => {
            localStorage.setItem("user", JSON.stringify(x.data))
            setIsLoading(false);
            nav("/home");
        })
    }

    function submitRegister(data: any){
        const username = data.username;
        const password = data.password;
        setIsLoading(true);
        APIRegister(username, password).then(x => {
            localStorage.setItem("user", JSON.stringify(x.data))
            setIsLoading(false);
            nav("/home");
        })
    }

    return (
        <div className="m-auto items-center w-[30rem] h-[20rem] rounded-md bg-secondary">
            <div className="w-[100%]">
                <h1 className="m-auto text-[40px] text-center mt-5 select-none">Support Hub</h1>
                <form className="p-5 flex flex-col gap-5" onSubmit={handleSubmit(submitLogin)}>
                    <div className="w-[100%] h-[3rem] bg-primary flex items-center rounded-md">
                        <span className="material-symbols-outlined absolute pl-2 select-none text-foreground">
                            person
                        </span>
                        <input placeholder="Username/Email" className="w-[100%] h-[3rem] pl-10 text-foreground outline-none" {...register('username')} />
                    </div>
                    <div className="w-[100%] h-[3rem] bg-primary flex items-center rounded-md">
                        <span className="material-symbols-outlined absolute pl-2 select-none text-foreground">
                            lock
                        </span>
                        <input placeholder="Password" type="password" className="w-[100%] h-[3rem] pl-10 text-foreground outline-none" {...register('password')} />
                    </div>
                    <div className="flex flex-row gap-2">
                        <button type="submit" className="w-[50%] hover:bg-primary-accent cursor-pointer transition duration-50 rounded-md h-[3rem] bg-primary text-foreground">Login</button>
                        <button type="button" onClick={handleSubmit(submitRegister)} className="w-[50%] hover:bg-primary-accent cursor-pointer transition duration-50 rounded-md h-[3rem] bg-primary text-foreground ">Register</button>
                    </div>
                </form>
            </div>
        </div>

    )
}