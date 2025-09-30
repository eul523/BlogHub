import api from "../api/api";
import PostCard from "../components/PostCard.jsx";
import UserCard from "../components/UserCard.jsx";
import { useLoaderData } from "react-router";

export async function loader({ request }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    if (!q) return { err: "Query string required." };
    try {
        const data = await api.get(`/search?q=${encodeURIComponent(q)}`);
        return data.data;
    } catch (err) {
        return { err: err.response?.data?.msg || "Something went wrong." }
    }
}

export default function Search() {
    const data = useLoaderData();
    if (data.err) {
        return <p>{data.err}</p>
    }

    return (
        <div>
            {data.users.map(u => <UserCard {...u} />)}
            {data.posts.map(u => <PostCard {...u} />)}
        </div>
    )
}