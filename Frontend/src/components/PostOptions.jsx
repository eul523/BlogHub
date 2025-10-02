import { Heart, MessageCircle, MoreHorizontal, } from "lucide-react";
import { HeartFilled } from "./Svgs.jsx";
import api from "../api/api.js";
import { useNotificationStore } from "../stores/notificationStore";
import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import CircularProgress from '@mui/material/CircularProgress';


function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();

    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();

    if (year === now.getFullYear()) {
        return `${month} ${day}`;
    } else {
        return `${month} ${year}`;
    }
}

const formatNumber = (num) => {
    return new Intl.NumberFormat("en", {
        notation: "compact",
        compactDisplay: "short",
    }).format(num);
};


export default function PostOptions({ likesCount, commentsCount, dateWritten, liked, setLiked, setLikesCount, setCommentsCount, slug, expanded, setShowComments = console.log, isOwner, favourite, setFavourite }) {
    const [liking, setLiking] = useState(false);
    const [favouriting, setFavouriting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { addNotification } = useNotificationStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);
    const settingsRef = useRef(null);


    async function handleLike() {
        setLiking(true);
        try {
            let res;
            if (!liked) res = await api.post(`posts/${slug}/like`);
            else res = await api.delete(`posts/${slug}/like`);
            addNotification(liked ? "Unliked" : "Liked!", "success");
            setLiked(p => !p);
            setLikesCount(res.data.likesCount);
        } catch (err) {
            if (err.response.status === 401) {
                addNotification("Login to access this feature.", "error");
                setLiking(false);
                return navigate(`/login?redirectTo=${location.pathname}`);
            }
            addNotification(err.response.status?.msg || `Couldn't ${liked ? "Unlike" : "Like"} the post.`, "error")
        } finally {
            setLiking(false);
        }
    }

    async function handleFavourite() {
        setFavouriting(true);
        if (favourite) {
            try {
                await api.delete(`/posts/${slug}/favourite`);
                addNotification("Removed from favourites.", "success")
                setFavourite(false);
            } catch (err) {
                addNotification(err.response?.data?.msg, "error")
            }
        } else {
            try {
                await api.post(`/posts/${slug}/favourite`);
                addNotification("Added to favourites.", "success")
                setFavourite(true);
            } catch (err) {
                addNotification(err.response?.data?.msg, "error")
            }
        }
        setFavouriting(false);
    }

    async function handleDelete() {
        setDeleting(true);
        try {
            await api.delete(`/posts/${slug}`);
            if(expanded)navigate("/");
            else window.location.reload();
            addNotification("Post deleted.", "success")
        } catch (err) {
            addNotification(err.response?.data?.msg, "error")
        }
        setDeleting(false);
    }

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setShowMore(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };

    }, [])


    return (
        <div className="flex justify-between px-4">
            <div className="flex justify-start gap-8 items-center my-4">
                <p className="text-gray-500 text-[0.7rem]">{formatDate(dateWritten)}</p>
                <button onClick={handleLike} disabled={liking} className="flex gap-1">
                    {liked ? <HeartFilled size={15} /> : <Heart size={15} color="currentColor" />}
                    <p className="text-[0.7rem]">{formatNumber(likesCount)}</p>

                </button>
                <button onClick={() => {
                    if (expanded) {
                        if (commentsCount === 0) {
                            fetchComments(Math.ceil(commentsCount / 20) + 1);
                            setShowComments(true);
                        } else {
                            setShowComments(p => !p);
                        }
                    } else {
                        navigate(`/posts/${slug}`)
                    }

                }} className="flex gap-1">
                    <MessageCircle size={15} />
                    <p className="text-[0.7rem]">{formatNumber(commentsCount)}</p>

                </button>

                <div ref={settingsRef} className="relative inline-block">
                    <button onClick={() => setShowMore(p => !p)}>
                        <MoreHorizontal size={20} />
                    </button>

                    {showMore && (
                        <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-[#1E1E1E] border p-2 rounded-md border-gray-500/50 shadow-md">
                            <button
                                onClick={() => {
                                    setShowMore(false);
                                    handleFavourite();
                                }}
                                disabled={favouriting}
                                className="whitespace-nowrap px-3 py-1 hover:bg-gray-100 hover:dark:bg-gray-700/50 rounded w-full flex justify-start"
                            >
                                {favouriting && <CircularProgress color="white" size={10} className="inline" />}
                                {favourite ? "Remove favourite" : "Add favourite"}
                            </button>

                            {isOwner && (
                                <button
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this post?")) {
                                            setShowMore(false);
                                            handleDelete();
                                        }
                                    }}
                                    disabled={deleting}
                                    className="whitespace-nowrap px-3 py-1 hover:bg-red-500/20 rounded text-red-600 w-full flex justify-start"
                                >
                                    {deleting && (
                                        <CircularProgress color="white" size={10} className="inline" />
                                    )}
                                    Delete Post
                                </button>
                            )}



                        </div>
                    )}
                </div>



            </div>


        </div>
    )
}