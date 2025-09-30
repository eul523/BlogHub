import { useLoaderData } from "react-router";
import api from "../api/api";
import PostDetail from "../components/PostDetail";

export async function loader({params}) {
    try{
        const post = await(api.get(`/posts/${params.slug}`));
        return post.data;
    }catch(err){
        return {err:err?.response?.data?.msg || "Something went wrong."}
    }
}

export default function Post(){
    const data = useLoaderData();
    if(data.err)return <h1>{data.err}</h1>
    return (
        <div className="w-full flex items-center justify-center">
            <PostDetail {...data}/>
        </div>
        
    )
}