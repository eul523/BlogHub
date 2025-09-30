import api from "../api/api.js";
import { useLoaderData, Await } from "react-router";
import PostCard from "../components/PostCard.jsx";
import { Suspense } from "react";

export async function Loader() {
    try {
        await new Promise(res=>setTimeout(res,2500))
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