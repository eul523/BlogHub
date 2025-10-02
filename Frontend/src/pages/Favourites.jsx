import api from "../api/api.js";
import { useLoaderData } from "react-router";
import PostCard from "../components/PostCard.jsx";

export async function loader() {
    try {
        const data = await api.get("/posts/favourites");
        return data.data.favouritePosts;
    } catch (err) {
        return {err:err?.response?.data?.msg || "Couldn't fetch posts. Try again."};
    }
}

export default function Favourites() {
    const data = useLoaderData();
    if(data.err)return <h1>{data.err}</h1>
    if(data.length===0)return <h1 className="m-4">No favourite posts. Add posts to favourite first.</h1>
    console.log(data)
    return (
            <div className="flex flex-col items-center justify-center">
                {data.map(p => <PostCard key={p._id} {...p} />)}
            </div>
        )
} 