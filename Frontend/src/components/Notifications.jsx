import api from "../api/api";
import { Link } from "react-router";
import { formatDate } from "./PostOptions";
import { useState } from "react";
import { toast } from "react-hot-toast";

function Notification({ _id, type, content, createdAt, additionalInfo, setShowNotif }) {
    const additionalTypes = { newPost: "slug", newLike: "slug", newComment: "slug", newReply: "slug", newFollower: "username"};
    const linkTo = type==="newPost" ? `/posts/${additionalInfo[additionalTypes[type]]}` : `/users/${additionalInfo[additionalTypes[type]]}`;

    return (
        <div className="w-56 p-0 flex border-b last:border-b-0 m-0">
            {linkTo ? (
                <Link onClick={() => setShowNotif(false)} className="w-56 p-2 hover:bg-gray-400/30 hover:dark:bg-gray-700/30 rounded-2xl" to={linkTo}>
                    <p className="text-sm">{content}</p>
                    <p className="text-[0.7rem] text-gray-400">{formatDate(createdAt)}</p>
                </Link>
            ) : (
                <div className="w-full p-2 hover:bg-gray-400/30 hover:dark:bg-gray-700/30 rounded-2xl">
                    <p className="text-sm">{content}</p>
                    <p className="text-[0.7rem] text-gray-400">{formatDate(createdAt)}</p>
                </div>
            )}
        </div>
    )
}

export default function Notifications({ notifications, setNotifications, setShowNotif }){
    const [reading, setReading] = useState(false);
    const readAll = async () => {
        setReading(true);
        try{
            await api.post("/notifications/read-all");
            setNotifications([]);
            toast.success("Marked notifications as read.");
        }catch(err){
            toast.error("Something went wrong.");
        }
        setReading(false);
    }

    return (
        <div className="absolute right-[-100%] top-[50px] w-fit mt-2 rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-lg ring-1 ring-black/10 z-50 flex flex-col p-4 space-y-4 dark:border dark:border-gray-600 ">
            {notifications.length===0 ? (
               <p className="whitespace-nowrap">You're all caught up.</p>
            ) : (
                <>
                {notifications.map(n => <Notification key={n._id} {...{...n, setShowNotif}}/>)}
                <button className={`mt-2 text-sm hover:underline ${reading ? "text-gray-400" : ""}`} disabled={reading} onClick={readAll}>Mark all as read</button>
                </>
            )}
        </div>
    )
}