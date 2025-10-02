import api from "../api/api";
import PostCard from "../components/PostCard.jsx";
import UserCard from "../components/UserCard.jsx";
import { useLoaderData, NavLink } from "react-router";

export async function loader({ request }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const filter = url.searchParams.get("filter") ? url.searchParams.get("filter") === "posts" ? "posts" : "users" : "posts";
    if (!q) return { err: "Query string required." };
    try {
        const data = await api.get(`/search/${filter}?q=${encodeURIComponent(q)}`);
        return { data: data.data, q, filter, len: data.data[filter].length };
    } catch (err) {
        return { err: err.response?.data?.msg || "Something went wrong." }
    }
}

export default function Search() {
    const { data, q, filter, len, err } = useLoaderData();
    if (err) {
        return <p>{err}</p>
    }

    return (
        <div className="p-4 space-y-4">
            {len > 0 ? (
                <>
                    <h1 className="text-2xl w-fit mx-auto font-bold"><span className="text-gray-500">Results for </span><span>{q}</span></h1>

                    <div className="flex gap-4 p-0 m-4 mb-8">
                        <NavLink to={`/search?q=${q}&filter=posts`} className={`${filter === "posts" ? "border-b border-b-black dark:border-b-gray-100" : "text-gray-500"} p-2`}>Posts</NavLink>

                        <NavLink className={`${filter === "users" ? "border-b border-b-black dark:border-b-gray-100" : "text-gray-500"} p-2`} to={`/search?q=${q}&filter=users`}>Users</NavLink>
                    </div>
                </>


            ) : (
                <h1 className="text-xl w-fit mx-auto">No results found. Make sure the spelling is correct and try again.</h1>
            )}


            {data.users && data.users.map(u => <UserCard key={u._id} {...u} />)}
            {data.posts && data.posts.map(u => <PostCard key={u._id} {...u} />)}
        </div>
    )
}