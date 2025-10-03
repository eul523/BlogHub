import api from "../api/api";
import PostCard from "../components/PostCard.jsx";
import UserCard from "../components/UserCard.jsx";
import { useLoaderData, NavLink } from "react-router";
import { useNotificationStore } from "../stores/notificationStore.js";
import CircularProgress from "@mui/material/CircularProgress";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";

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
    const { addNotification } = useNotificationStore();
    const [results, setResults] = useState(data.posts || data.users);
    const [fetching, setFetching] = useState(false);
    const [hasNext, setHasNext] = useState(data.hasNext);
    const [page, setPage] = useState(1);
    const { ref, inView } = useInView({
        rootMargin: "200px",
        skip: !hasNext || fetching
    });

    const fetchPosts = async function () {
        if (!hasNext || fetching) return;
        setFetching(true);
        try {
            const data = await api.get(`/search/${filter}?q=${q}&page=${page + 1}`);
            setResults(p => [...p, ...data.data[filter]]);
            setPage(data.data.currentPage);
            setHasNext(data.data.hasNext);
        } catch (err) {
            addNotification(err.response?.data?.msg || "Error fetching posts.", "error");
        } finally {
            setFetching(false);
        }
    }
    useEffect(() => {
        if (inView) {
            fetchPosts();
        }
    }, [inView, fetching, hasNext])

    return (
        <div className="p-4 space-y-4 flex flex-col justify-center items-center">
            {len > 0 ? (
                <>
                    <h1 className="text-2xl w-fit mx-auto font-bold"><span className="text-gray-500">Results for </span><span>{q}</span></h1>

                    <div className="flex gap-4 p-0 m-4 mb-8 w-[90%] max-w-[700px]">
                        <NavLink to={`/search?q=${q}&filter=posts`} className={`${filter === "posts" ? "border-b border-b-black dark:border-b-gray-100" : "text-gray-500"} p-2`}>Posts</NavLink>

                        <NavLink className={`${filter === "users" ? "border-b border-b-black dark:border-b-gray-100" : "text-gray-500"} p-2`} to={`/search?q=${q}&filter=users`}>Users</NavLink>
                    </div>
                </>


            ) : (
                <h1 className="text-xl w-fit mx-auto">No results found. Make sure the spelling is correct and try again.</h1>
            )}


            {filter==="users" && results.map(u => <UserCard key={u._id} {...u} />)}
            {filter==="posts" && results.map(u => <PostCard key={u._id} {...u} />)}

            <div ref={ref}>
                {!hasNext &&
                    <p className="text-[0.7rem] text-gray-600/80 dark:text-gray-400/80">Reached the bottom</p>
                }
                {fetching && <CircularProgress size={20} />}
            </div>
        </div>
    )
}