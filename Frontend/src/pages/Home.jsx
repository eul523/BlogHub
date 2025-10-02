import api from "../api/api.js";
import { useLoaderData } from "react-router";
import PostCard from "../components/PostCard.jsx";

export async function loader() {
    try {
        const data = await api.get("/posts");
        return data.data;
    } catch (err) {
        return err?.response?.data?.msg || "Couldn't fetch posts. Try again.";
    }
}

export default function Home() {
    const data = useLoaderData();
    if(!data.posts || data.posts.length===0)return <h1>No posts.</h1>
    return (
            <div className="flex flex-col items-center justify-center">
                {data.posts.map(p => <PostCard key={p._id} {...p} />)}
            </div>
        )
} 