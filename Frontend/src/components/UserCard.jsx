import { Link, useNavigate } from "react-router";
import { useState } from "react";
import api from "../api/api";
import { useForm } from "react-hook-form";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-hot-toast";

export default function ({ name, username, profileImage, description, isSelf, isFollowing, isAuthenticated }) {

    const [following, setFollowing] = useState(isFollowing);
    const {
            register,
            handleSubmit,
            formState: { errors, isSubmitting },
            reset
        } = useForm();
    const navigate = useNavigate();

    async function handleFollow(data) {
        try{
            if(following){
                const res = await api.delete(`/users/${data.username}/follow`);
                setFollowing(false);
                toast.success(`You unfollowed ${name}`);
            }else{
                await api.post(`/users/${data.username}/follow`);
                setFollowing(true);
                toast.success(`You started following ${name}`);
            }
        }catch(err){
            toast.error(err.response?.data?.msg || "Couldn't follow/unfollow");
        }
    }

    return (
        <div className="flex justify-between my-4 items-center w-full">
            <Link className="flex items-center gap-3" to={`/users/${username}`}>
                <img className="w-[90px] max-w-50 aspect-square rounded-full" src={import.meta.env.VITE_BASE_URL + profileImage} />
                <div className="flex flex-col">
                    <p className="text-2xl font-medium">{name}</p>
                    {description && description.length>0 && <p>{description}</p>}
                </div>
            </Link>

            {isSelf ? (
                    <div className="flex flex-row justify-center items-center gap-1">
                    <Link className="flex px-4 w-fit h-[50px] rounded-full bg-black dark:bg-[#1E1E1E] text-white justify-center items-center" to="/create-post">Write</Link>
                    </div>
                    
                ) : (
                    isAuthenticated ? (
                    <form className="" onSubmit={handleSubmit(handleFollow)}>
                    <input type="text" {...register("username")} hidden value={username} />
                    <button disabled={isSubmitting} className={`dark:bg-[#1E1E1E] h-[50px] rounded-full flex justify-center items-center p-4 ${following ? "border border-gray-500" : "bg-black text-white"}`}>{isSubmitting && <CircularProgress color="white" size={10} className="inline" />}{following ? "Unfollow" : "Follow"}</button>
                </form>
                ) : (
                    <button onClick={()=>{
                        toast.error("Login to access this feature.");
                        navigate("/login");
                    }} className={` h-[50px] p-4 rounded-full flex justify-center items-center ${isFollowing ? "border border-gray-500" : "bg-black dark:bg-[#1E1E1E] text-white"}`}>{isFollowing ? "Unfollow" : "Follow"}</button>
                )
            )}
        </div>
    )
}