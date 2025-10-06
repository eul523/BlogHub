import { Link } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";
import truncate from "truncate-html";
import PostOptions from "./PostOptions";
import { useState } from "react";


export default function Post({ title, body, likes_count, comments_count, slug, author, dateWritten, images, tags, liked:likedN, isOwner, isFavourite }) {
    const shortTitle = title.length>25 ? title.slice(0,25)+"..." : title;
    const snippet = body.length > 150 ? truncate(body, 100, { ellipsis: "..." }) : body;
    const [ liked, setLiked ] = useState(likedN);
    const [favourite, setFavourite] = useState(isFavourite);
    const [ likesCount, setLikesCount ] = useState(likes_count);
    const [ commentsCount, setCommentsCount ] = useState(comments_count);
    return (
        <>
            <div className="w-[95%] sm:w-[90%] max-w-[800px] border-b border-b-gray-500 flex justify-between my-2">
                <div className="flex flex-col items-center justify-center mt-0">
                    <div className="flex flex-2 flex-col max-w-[800px]   w-full mt-0">
                        <Link to={`/users/${author.username}`} className="flex justify-start gap-2 items-center">
                            <img src={import.meta.env.VITE_BACKEND_URL + "/api" + author.profileImage} className="w-[25px] h-[25px] rounded-full" />
                            <p>{author.name}</p>
                        </Link>

                        <Link to={`/posts/${slug}`} className="hover:underline text-2xl font-bold mt-4">{shortTitle}</Link>

                        <div className="sm:hidden flex overflow-x-scroll gap-4 my-4">
                            {images.length>0 &&
                               images.map(i=>(
                                <img key={i} src={import.meta.env.VITE_BACKEND_URL + "/api" + i} className="h-[110px] aspect-auto"/>
                               ))
                            }

                        </div>

                        <Link to={`/posts/${slug}`} className="text-gray-500">
                        <RichTextEditor content={snippet} editable={false} className="border-0" />
                        </Link>

                    </div>
                    <div className="w-full">
                        <PostOptions {...{ likesCount, commentsCount, dateWritten, liked, setLiked,setLikesCount, setCommentsCount, slug, expanded:false,isOwner, favourite, setFavourite }}/>

                    </div>
                    
                </div>

                {images?.length > 0 &&
                        <img key={images[0]} className="h-[100px] max-w-[50%]  aspect-auto border mt-[5%] hidden sm:block" src={import.meta.env.VITE_BACKEND_URL + "/api" + images[0]} />
                    }

            </div>


        </>


    )
}