import { Link, Form } from "react-router";
import api from "../api/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import CircularProgress from '@mui/material/CircularProgress';
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";

function Reply({ reply, setReplies, slug, commentId, setShowReplies }) {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const imgSrc = import.meta.env.VITE_BASE_URL + reply.author.profileImage;
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm();

    async function handleReplySubmit(data) {
        try {
            const res = await api.post(`/posts/${slug}/comments/${commentId}/replies`, { content: data.content, to: reply.author.username });
            setShowReplyInput(false);
            setShowReplies(true);
            setReplies(p => [res.data.reply, ...p]);
        } catch (err) {
            toast.error(err.response.data?.msg || "Couldn't reply.");
        }
    }

    return (
        <div className="space-y-1">
            <Link className="flex  items-center gap-2 w-fit" to={`/users/${reply.author.username}`}>
                <img src={imgSrc} className="h-[20px] aspect-square rounded-full" />
                <p>@{reply.author.username}</p>
            </Link>
            <p>{reply.to && <Link to={`/users/${reply.to}`}>{`@${reply.to}`}</Link>}  {reply.content}</p>
            <button className="text-[0.7rem] font-medium hover:bg-gray-400/50 px-2 py-0.5 rounded-full" onClick={() => setShowReplyInput(true)}>Reply</button>
            {showReplyInput &&
                    <form onSubmit={handleSubmit(handleReplySubmit)}>
                        <div className="flex flex-col">
                            <input className="border-b text-sm focus:outline-0 focus:border-b-2 p-1" placeholder="Type your reply" autoComplete="off" type="text" {...register("content", { required: "Input required." })} />
                            {errors.content && <p className="text-red-500">{errors.content.message}</p>}
                        </div>
                        <button className="p-1 py-0.5 rounded-full hover:bg-gray-400/50 text-gray-500 text-sm" type="button" onClick={() =>{reset();setShowReplyInput(false)} }>Cancle</button>
                        <button className="m-2 p-1 py-0.5 rounded-full bg-blue-600 text-white text-sm" disabled={isSubmitting} type="submit">{isSubmitting && <CircularProgress color="white" size={10} className="inline" />}Reply</button>
                    </form>
                }
        </div>
    )
}

export function Comment({ content, author, repliesLen, _id, slug }) {
    const [replies, setReplies] = useState([]);
    const [moreReply, setMoreReply] = useState(repliesLen > 0);
    const [fetchingReply, setFetchingReply] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm();


    async function fetchReplies(page = 1, limit = 20) {
        setFetchingReply(true);
        try {
            const repliesData = await api.get(`/posts/${slug}/comments/${_id}/replies?limit=${limit}&page=${page}`);
            setMoreReply(repliesData.data.currentPage < repliesData.data.totalPages);
            setShowReplies(true);
            setReplies(p => [...p, ...repliesData.data.replies]);
        } catch (err) {
            toast.error(err.response.data?.msg || "Couldn't fetch replies.");
        } finally {
            setFetchingReply(false);
        }

    }

    async function handleReplySubmit(data) {
        try {
            const res = await api.post(`/posts/${slug}/comments/${_id}/replies`, { content: data.content });
            setShowReplyInput(false);
            setMoreReply(true);
            setReplies(p => [res.data.reply, ...p]);
        } catch (err) {
            toast.error(err.response.data?.msg || "Couldn't reply.");
        }
    }

    return (
        <div className="space-y-1 my-1">
            <div className="flex gap-2">
                <Link className="flex  items-center gap-2 w-fit" to={`/users/${author.username}`}>
                <img src={import.meta.env.VITE_BASE_URL + author.profileImage} className="h-[30px] aspect-square rounded-full" />
            </Link>
            <div className="pt-2">
                <p>@{author.username}</p>
                <p className="ml-2">{content}</p>
            </div>
            </div>
            

            <div className="ml-4">
                <button className="text-[0.7rem] font-medium hover:bg-gray-400/50 px-2 py-0.5 rounded-full" onClick={() => setShowReplyInput(true)}>Reply</button>

                {(moreReply || replies.length > 0) && <button disabled={fetchingReply} className="inline text-blue-600 hover:bg-blue-600/20 w-fit m-auto px-2 py-0.5 rounded-full text-[0.7rem]" onClick={() => {
                    if (replies.length === 0) {
                        fetchReplies(Math.ceil(replies.length / 20) + 1);
                        setShowReplies(true);
                    } else {
                        setShowReplies(p => !p);
                    }
                }}>{showReplies ? <ChevronUp size={15} className="inline" /> : <ChevronDown size={15} className="inline" />}Replies</button>}
                {showReplyInput &&
                    <form onSubmit={handleSubmit(handleReplySubmit)}>
                        <div className="flex flex-col">
                            <input className="border-b text-sm focus:outline-0 focus:border-b-2 p-1" placeholder="Type your reply" autoComplete="off" type="text" {...register("content", { required: "Input required." })} />
                            {errors.content && <p className="text-red-500">{errors.content.message}</p>}
                        </div>
                        <button className="text-sm p-2 py-1 rounded-full hover:bg-gray-400/50 text-gray-500" type="button" onClick={() =>{reset();setShowReplyInput(false)} }>Cancle</button>
                        <button className="text-sm m-2 p-2 py-1 rounded-full bg-blue-600 text-white" disabled={isSubmitting} type="submit">{isSubmitting && <CircularProgress color="white" size={10} className="inline" />}Reply</button>
                    </form>
                }


                {showReplies && replies.length > 0 && (
                    <div className="border-l pl-2">
                        {replies.map(reply => (
                            <Reply key={reply._id} {...{ reply, setReplies, slug, commentId: _id, setShowReplies }} />
                        ))}
                        {moreReply && <button className="text-sm ml-2 px-2 text-white bg-blue-500 rounded-full" disabled={!moreReply || fetchingReply} onClick={() => fetchReplies(Math.ceil(replies.length / 20) + 1)}>{fetchingReply && <CircularProgress size={10}/>}Load more</button>}
                        
                    </div>
                )}
            </div>

        </div>
    )
}