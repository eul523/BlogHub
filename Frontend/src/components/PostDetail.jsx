import { Link, Form } from "react-router";
import RichTextEditor from "./RichTextEditor";
import PostOptions from "./PostOptions";
import { useState } from "react";
import { Comment } from "./Comment.jsx";
import { useNotificationStore } from "../stores/notificationStore.js";
import { useForm } from "react-hook-form";
import CircularProgress from '@mui/material/CircularProgress';
import api from "../api/api.js";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PostDetail({ _id, title, body, likes_count, comments_count, slug, author, dateWritten, images, tags, liked: likedN, isFavourite, isOwner }) {
    const [liked, setLiked] = useState(likedN);
    const [favourite, setFavourite] = useState(isFavourite);
    const [likesCount, setLikesCount] = useState(likes_count);
    const [commentsCount, setCommentsCount] = useState(comments_count);
    const [comments, setComments] = useState([]);
    const [moreComments, setMoreComments] = useState(commentsCount > 0);
    const [fetchingComments, setFetchingComments] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const { addNotification } = useNotificationStore();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm();

    async function fetchComments(page = 1, limit = 20) {
        setFetchingComments(true);
        try {
            const commentsData = await api.get(`/posts/${slug}/comments/?limit=${limit}&page=${page}`);
            setMoreComments(commentsData.data.currentPage < commentsData.data.totalPages);
            setComments(p => [...p, ...commentsData.data.comments]);
        } catch (err) {
            console.log(err)
            addNotification(err.response.data?.msg || "Couldn't fetch comments.", "error");
        } finally {
            setFetchingComments(false);
        }

    }
    async function handleCommentSubmit(data) {
        try {
            const res = await api.post(`/posts/${slug}/comments/`, { content: data.content });
            setCommentsCount(p => p + 1);
            setShowComments(true);
            reset({}, { keepErrors: false })
            setComments(p => [res.data.comment, ...p]);
        } catch (err) {
            addNotification(err.response?.data?.msg || "Couldn't Comment.", "error");
        }
    }


    return (
        <div className="flex flex-col max-w-[700px] w-[90%] justify-center h-full space-y-8">
            <Link to={`/users/${author.username}`} className="flex justify-start gap-2 items-center">
                <img src={import.meta.env.VITE_BASE_URL + author.profileImage} className="w-[25px] aspect-square rounded-full" />
                <p>{author.name}</p>

            </Link>

            <h1 className="font-extrabold text-3xl">{title}</h1>
            {images.length > 0 &&
                <div className="h-fit overflow-x-scroll flex gap-2 p-0 overflow-y-visible">
                    {images.map(i => <img key={i} className="h-[200px] aspect-auto" src={import.meta.env.VITE_BASE_URL + i} />)}
                </div>
            }
            <RichTextEditor content={body} editable={false} />

            {tags.length > 0 && <div className="flex gap-1 text-white">
                {tags.map(tag => <Link to={`/search?q=${tag}`} key={tag} className="border rounded text-[0.7rem] bg-gray-400 dark:bg-[#1E1E1E] px-1">{"#" + tag}</Link>)}
            </div>}


            <PostOptions {...{ likesCount, commentsCount, dateWritten, liked, setLiked, setLikesCount, setCommentsCount, slug, expanded: true, setShowComments, isOwner, favourite, setFavourite }} />

            <form onSubmit={handleSubmit(handleCommentSubmit)}>
                <div className="flex flex-col">
                    <input className="border-b text-sm focus:outline-0 focus:border-b-2 p-1" placeholder="Type your comment" autoComplete="off" type="text" {...register("content", { required: "Input required." })} />
                    {errors.content && <p className="text-red-500">{errors.content.message}</p>}
                </div>
                <button className="p-2 py-1 rounded-full hover:bg-gray-400/50 text-gray-500" type="button" onClick={() => reset()}>Cancle</button>
                <button className="m-2 p-2 py-1 rounded-full bg-blue-600 text-white" disabled={isSubmitting} type="submit">{isSubmitting && <CircularProgress color="white" size={10}  className="inline"/>}Comment</button>
            </form>

            {(moreComments || comments.length > 0) && <button disabled={fetchingComments} className="text-blue-600 hover:bg-blue-600/20 w-fit m-auto p-2 rounded-full flex justify-center items-center gap-2" onClick={() => {
                if (comments.length === 0) {
                    fetchComments(Math.ceil(comments.length / 20) + 1);
                    setShowComments(true);
                } else {
                    setShowComments(p => !p);
                }
            }}>{showComments ? <ChevronUp size={20} className="inline" /> : <ChevronDown size={20} className="inline" />}Comments</button>}
            {comments.length === 0 && fetchingComments && <CircularProgress color="primary" className="w-fit mx-auto" />}
            {showComments && comments.length > 0 && (
                <>
                    {comments.map(comment => (
                        <Comment key={comment._id} {...{ ...comment, slug }} />
                    ))}
                    {moreComments && <button disabled={!moreComments || fetchingComments} onClick={() => fetchComments(Math.ceil(comments.length / 20) + 1)}>Load more</button>}
                    {fetchingComments && <CircularProgress color="primary" />}
                </>
            )}
        </div>
    )
}