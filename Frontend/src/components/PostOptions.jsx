import { Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { HeartFilled } from "./Svgs.jsx";
import api from "../api/api.js";
import { useNotificationStore } from "../stores/notificationStore";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";


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


export default function PostOptions({ likesCount, commentsCount, dateWritten, liked, setLiked, setLikesCount, setCommentsCount, slug, expanded, setShowComments = console.log }) {
    const [liking, setLiking] = useState(false);
    const { addNotification } = useNotificationStore();
    const location = useLocation();
    const navigate = useNavigate();

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

                
            </div>

        </div>
    )
}