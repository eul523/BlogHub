import useAuthStore from "../stores/authStore.js";
import api from "../api/api.js";
import { useLoaderData, Link, useNavigate } from "react-router";
import PostCard from "../components/PostCard.jsx";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import CircularProgress from '@mui/material/CircularProgress';
import { Edit, Pen } from "lucide-react";
import { useInView } from "react-intersection-observer";

export async function loader({ params }) {
    try {
        const user = await api.get(`/users/${params.username}`);
        const posts = await api.get(`/users/${params.username}/posts`)
        return { user: user.data, posts: posts.data };
    } catch (err) {
        return err.data?.msg || "Something went wrong."
    }
}

export default function User() {
    const data = useLoaderData();
    const username = useAuthStore()?.user?.username;
    if (!data.user) return <h1 className="text-red h-full w-full p-auto m-auto">{data}</h1>
    const isSelf = username === data.user.username;
    const user = data.user;
    const postsInit = data.posts;
    const [following, setFollowing] = useState(user.isFollowing);
    const { isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm();

    const [posts, setPosts] = useState(postsInit.posts);
    const [fetching, setFetching] = useState(false);
    const [hasNext, setHasNext] = useState(data.posts.hasNext);
    const [page, setPage] = useState(1);
    const { ref, inView } = useInView({
        rootMargin: "200px",
        skip: !hasNext || fetching
    });

    const fetchPosts = async function () {
        if (!hasNext || fetching) return;
        setFetching(true);
        try {
            const res = await api.get(`/users/${data.user.username}/posts?page=${page + 1}`);
            setPosts(p => [...p, ...res.data.posts]);
            setPage(res.data.currentPage);
            setHasNext(res.data.posts.hasNext);
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


    async function handleFollow(data) {
        try {
            if (following) {
                const res = await api.delete(`/users/${data.username}/follow`);
                setFollowing(false);
                toast.success(`You unfollowed ${user.name}`);
            } else {
                await api.post(`/users/${data.username}/follow`);
                setFollowing(true);
                toast.success(`You started following ${user.name}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.msg || "Couldn't follow/unfollow");
        }
    }

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col justify-center items-center space-y-2 m-2 w-[90%] max-w-[700px]">
                <h2 className="text-2xl">{user.name}</h2>
                <img className="w-[200px] aspect-square max-w-[50vw] rounded-full" src={import.meta.env.VITE_BASE_URL + user.profileImage} />
                {user.description && user.description.length > 0 &&
                    <p>{user.description}</p>
                }
                <Link to={`/users/${user.username}/followers`}>{user.followers_count} <span>Followers</span></Link>
                <p>{user.following_count} <span>Following</span></p>
                {isSelf ? (
                    <div className="flex flex-row w-full justify-center items-center gap-1">
                        <Link to={"/edit-profile"} className="w-full h-[50px] rounded-full bg-black dark:bg-[#1E1E1E] text-white flex justify-center items-center"><Edit className="mr-1" />Edit profile</Link>
                        <Link className="flex px-4 w-fit h-[50px] rounded-full bg-black dark:bg-[#1E1E1E] text-white justify-center items-center" to="/create-post"><Pen className="mr-1" />Write</Link>
                    </div>

                ) : (
                    isAuthenticated ? (
                        <form className="w-full" onSubmit={handleSubmit(handleFollow)}>
                            <input type="text" {...register("username")} hidden value={user.username} />
                            <button disabled={isSubmitting} className={`w-full h-[50px] rounded-full flex justify-center items-center ${following ? "border border-gray-500" : "bg-black dark:bg-[#1E1E1E] text-white"}`}>{isSubmitting && <CircularProgress color="white" size={10} className="inline" />}{following ? "Unfollow" : "Follow"}</button>
                        </form>
                    ) : (
                        <button onClick={() => {
                            toast.error("Login to access this feature.");
                            navigate("/login");
                        }} className={`w-full h-[50px] rounded-full flex justify-center items-center ${user.isFollowing ? "border border-gray-500" : "bg-black dark:bg-[#1E1E1E] text-white"}`}>{user.isFollowing ? "Unfollow" : "Follow"}</button>
                    )
                )}

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