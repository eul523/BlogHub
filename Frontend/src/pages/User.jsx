import useAuthStore from "../stores/authStore.js";
import api from "../api/api.js";
import { useLoaderData, Link, useNavigate } from "react-router";
import PostCard from "../components/PostCard.jsx";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useNotificationStore } from "../stores/notificationStore.js";
import CircularProgress from '@mui/material/CircularProgress';
import { Edit, Pen } from "lucide-react";

export async function loader({params}) {
    try{
        const user = await api.get(`/users/${params.username}`);
        const posts = await api.get(`/users/${params.username}/posts`)
        return {user:user.data, posts:posts.data};
    }catch(err){
        return err.data?.msg || "Something went wrong."
    }
}

export default function User(){
    const data = useLoaderData();
    const username = useAuthStore()?.user?.username;
    if(!data.user)return <h1 className="text-red h-full w-full p-auto m-auto">{data}</h1>
    const isSelf = username === data.user.username;
    const user = data.user;
    const posts = data.posts;
    const [following, setFollowing] = useState(user.isFollowing);
    const { isAuthenticated } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm();

    async function handleFollow(data) {
        try{
            if(following){
                const res = await api.delete(`/users/${data.username}/follow`);
                setFollowing(false);
                addNotification(`You unfollowed ${user.name}`,"success");
            }else{
                await api.post(`/users/${data.username}/follow`);
                setFollowing(true);
                addNotification(`You started following ${user.name}`,"success");
            }
        }catch(err){
            addNotification(err.response?.data?.msg || "Couldn't follow/unfollow","error");
        }
    }

    return(
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center space-y-2 m-2 w-[90%] max-w-[700px]">
                <h2 className="text-2xl">{user.name}</h2>
                <img className="w-[200px] aspect-square max-w-[50vw] rounded-full" src={import.meta.env.VITE_BASE_URL + user.profileImage} />
                {user.description && user.description.length>0 && 
                    <p>{user.description}</p>
                }
                <p>{user.followers_count} <span>Followers</span></p>
                <p>{user.following_count} <span>Following</span></p>
                {isSelf ? (
                    <div className="flex flex-row w-full justify-center items-center gap-1">
                    <Link to={"/edit-profile"} className="w-full h-[50px] rounded-full bg-black text-white flex justify-center items-center"><Edit className="mr-1"/>Edit profile</Link>
                    <Link className="flex px-4 w-fit h-[50px] rounded-full bg-black text-white justify-center items-center" to="/create-post"><Pen className="mr-1"/>Write</Link>
                    </div>
                    
                ) : (
                    isAuthenticated ? (
                    <form className="w-full" onSubmit={handleSubmit(handleFollow)}>
                    <input type="text" {...register("username")} hidden value={user.username} />
                    <button disabled={isSubmitting} className={`w-full h-[50px] rounded-full flex justify-center items-center ${following ? "border border-gray-500" : "bg-black text-white"}`}>{isSubmitting && <CircularProgress color="white" size={10} className="inline" />}{following ? "Unfollow" : "Follow"}</button>
                </form>
                ) : (
                    <button onClick={()=>{
                        addNotification("Login to access this feature.","error");
                        navigate("/login");
                    }} className={`w-full h-[50px] rounded-full flex justify-center items-center ${user.isFollowing ? "border border-gray-500" : "bg-black text-white"}`}>{user.isFollowing ? "Unfollow" : "Follow"}</button>
                )
            )}
                
            </div>

            {posts.posts.map(p=>(
                <PostCard key={p._id} {...p}/>
            ))}
        </div>
    )
}