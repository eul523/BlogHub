import { Link } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";
import truncate from "truncate-html";
import PostOptions from "./PostOptions";
import { useState } from "react";


export default function Post({ title, body, likes_count, comments_count, slug, author, dateWritten, images, tags, liked:likedN }) {
    const shortTitle = title.length>25 ? title.slice(0,25)+"..." : title;
    const snippet = body.length > 150 ? truncate(body, 100, { ellipsis: "..." }) : body;
    const [ liked, setLiked ] = useState(likedN);
    const [ likesCount, setLikesCount ] = useState(likes_count);
    const [ commentsCount, setCommentsCount ] = useState(comments_count);
    return (
        <>
            <div className="w-[90%] max-w[700px] border-b border-b-gray-500 flex justify-between my-2">
                <div className="flex flex-col items-center justify-center mt-0">
                    <div className="flex flex-2 flex-col max-w-[700px]   w-full mt-0">
                        <Link to={`/users/${author.username}`} className="flex justify-start gap-2 items-center">
                            <img src={import.meta.env.VITE_BASE_URL + author.profileImage} className="w-[25px] h-[25px] rounded-full" />
                            <p>{author.name}</p>
                        </Link>

                        <Link to={`/posts/${slug}`} className="hover:underline text-2xl font-bold mt-4">{shortTitle}</Link>

                        <Link to={`/posts/${slug}`} className="text-gray-500">
                        <RichTextEditor content={snippet} editable={false} className="border-0" />
                        </Link>

                    </div>
                    <div className="w-full">
                        <PostOptions {...{ likesCount, commentsCount, dateWritten, liked, setLiked,setLikesCount, setCommentsCount, slug, expanded:false }}/>

                    </div>
                    
                </div>

                {images?.length > 0 &&
                        <img className="h-[100px] max-w-[50%]  aspect-auto border mt-[5%]" src={import.meta.env.VITE_BASE_URL + images[0]} />
                    }

            </div>


        </>


    )
}