import api from "../api/api.js";
import { useLoaderData, Link } from "react-router";
import PostCard from "../components/PostCard.jsx";
import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore.js";
import CircularProgress from "@mui/material/CircularProgress";
import { useInView } from "react-intersection-observer";

export async function loader() {
    try {
        const data = await api.get("/posts");
        return data.data;
    } catch (err) {
        return err?.response?.data?.msg || "Couldn't fetch posts. Try again.";
    }
}

export default function Home() {
    const { addNotification } = useNotificationStore();
    const data = useLoaderData();

    if (!data.posts || data.posts.length === 0) return <h1>No posts.</h1>

    const [posts, setPosts] = useState(data.posts);
    const [fetching, setFetching] = useState(false);
    const [hasNext, setHasNext] = useState(data.hasNext);
    const [page, setPage] = useState(1);
    const { ref, inView } = useInView({
        rootMargin:"200px",
        skip:!hasNext || fetching
    });

    const fetchPosts = async function () {
        if(!hasNext || fetching)return;
        setFetching(true);
        try {
            const data = await api.get(`/posts?page=${page + 1}`);
            setPosts(p => [...p, ...data.data.posts]);
            setPage(data.data.currentPage);
            setHasNext(data.data.hasNext);
            console.log(data.data.currentPage,data.data.hasNext)
        } catch (err) {
            addNotification(err.response?.data?.msg || "Error fetching posts.", "error");
        } finally {
            setFetching(false);
        }
    }
    useEffect(() => {
        if(inView){
            fetchPosts();
        }
    }, [inView, fetching, hasNext])

    return (
        <div className="flex flex-col items-center justify-center">
            {posts.map(p => <PostCard key={p._id} {...p} />)}

            <div ref={ref}>
                {!hasNext && 
                   <p className="text-[0.7rem] text-gray-600/80 dark:text-gray-400/80">Riched the bottom</p>
                }
            {fetching && <CircularProgress size={20}/>}
            </div>
            
        </div>
    )
} 