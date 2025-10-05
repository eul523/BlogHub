import useAuthStore from "../stores/authStore.js";
import api from "../api/api.js";
import { useLoaderData, Link } from "react-router";
import PostCard from "../components/PostCard.jsx";
import { Edit, Pen } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress";

export async function loader() {
    try {
        const posts = await api.get("/posts/me");
        return posts.data;
    } catch (err) {
        return { err: err.response?.data?.msg || "Something went wrong." }
    }
}

export default function Me() {
    const data = useLoaderData();

    if (data.err) return <h1>{data.err}</h1>

    const user = useAuthStore()?.user;
    const [posts, setPosts] = useState(data.posts);
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
            const res = await api.get(`/posts/me?page=${page + 1}`);
            setPosts(p => [...p, ...res.data.posts]);
            setPage(res.data.currentPage);
            setHasNext(res.data.hasNext);
        } catch (err) {
            toast.error(err.response?.data?.msg || "Error fetching posts.");
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
            {posts.map(p => (
                <PostCard key={p._id} {...p} />
            ))}

            <div ref={ref}>
                {!hasNext &&
                    <p className="text-[0.7rem] text-gray-600/80 dark:text-gray-400/80">Reached the bottom</p>
                }
                {fetching && <CircularProgress size={20} />}
            </div>
        </div>
    )
}