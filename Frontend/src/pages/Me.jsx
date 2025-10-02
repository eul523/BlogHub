import useAuthStore from "../stores/authStore.js";
import api from "../api/api.js";
import { useLoaderData, Link } from "react-router";
import PostCard from "../components/PostCard.jsx";
import { Edit, Pen } from "lucide-react";

export async function loader() {
    try {
        const posts = await api.get("/posts/me");
        return posts.data;
    } catch (err) {
        return {err:err.response?.data?.msg || "Something went wrong."}
    }
}

export default function Me() {
    const posts = useLoaderData();
    const user = useAuthStore()?.user;

    if(posts.err)return <h1>{posts.err}</h1>
    console.log(posts)
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center space-y-2 m-2 w-[90%] max-w-[700px]">
                <h2 className="text-2xl">{user.name}</h2>
                <img className="w-[200px] aspect-square max-w-[50vw] rounded-full" src={import.meta.env.VITE_BASE_URL + user.profileImage} />
                {user.description && user.description.length > 0 &&
                    <p>{user.description}</p>
                }
                <p>{user.followers_count} <span>Followers</span></p>
                <p>{user.following_count} <span>Following</span></p>
                <div className="flex flex-row w-full justify-center items-center gap-1">
                    <Link to={"/edit-profile"} className="w-full h-[50px] rounded-full bg-black dark:bg-[#1E1E1E] text-white flex justify-center items-center"><Edit className="mr-1" />Edit profile</Link>
                    <Link className="flex px-4 w-fit h-[50px] rounded-full bg-black dark:bg-[#1E1E1E] text-white justify-center items-center" to="/create-post"><Pen className="mr-1" />Write</Link>
                </div>
            </div>
            {posts.posts.map(p => (
                <PostCard key={p._id} {...p} />
            ))}
        </div>
    )
}