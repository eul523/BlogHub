import api from "../api/api.js";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";

export default function SearchBar() {
    const [searchInput, setSearchInput] = useState("");
    const [focused, setFocused] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        if (!searchInput.trim()) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const response = await api.get(
                    `/search/autocomplete?q=${encodeURIComponent(searchInput)}`
                );
                setSuggestions(response.data);
            } catch (error) {
                console.error('Autocomplete error:', error);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleSubmit = e => {
        e.preventDefault();
        if(searchInput.length===0)return;
        e.currentTarget.value="";
        setSearchInput("");
        navigate(`/search?q=${encodeURIComponent(searchInput)}`)
    }

    return (
        <div className="relative max-w-[30vw]">
            <form className="flex rounded-full bg-gray-400/30 p-1.5 gap-1" onSubmit={handleSubmit}>
                <button><Search /></button>
                <input className="focus:outline-0" ref={inputRef} autoComplete="off" onChange={e => setSearchInput(e.target.value)} type="text" name="q" onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 200)} placeholder="Search" />
            </form>

            {focused && (suggestions.posts?.length || suggestions.users?.length) > 0 &&
                <div className="absolute mt-2 ml-4 bg-white dark:bg-[#1E1E1E] shadow-[0_0_20px_rgba(0,0,0,0.3)] p-2 rounded max-h-72 overflow-y-auto w-[70vw] sm:w-full right-[-100%] sm:right-auto max-w-[500px]">
                    {suggestions.posts.length>0 && 
                    <div className="flex flex-col justify-center items-center py-2">
                    <p className="font-medium w-full border-b-1 text-center pb-2 mb-2 underline">Posts</p>
                    {suggestions.posts.map(post => (
                        <Link className="w-full flex items-center gap-2 hover:bg-gray-500/50 rounded p-1" onClick={()=>{if(inputRef.current)inputRef.current.value="";setSearchInput("")}} to={`/posts/${post.slug}`}>
                            <p className="font-medium">{post.title}</p>
                            </Link>
                    ))}
                    </div>
                    }
                    {suggestions.users.length>0 &&
                    <div className="flex flex-col justify-center items-center py-2">
                    <p className="font-medium w-full border-b-1 text-center pb-2 mb-2 underline">People</p>
                    {suggestions.users.map(user => (
                        <Link className="w-full flex items-center gap-2 hover:bg-gray-500/50 rounded p-1" onClick={()=>{if(inputRef.current)inputRef.current.value="";setSearchInput("")}} to={`/users/${user.username}`}>
                            <img src={import.meta.env.VITE_BACKEND_URL + "/api"+user.profileImage} className="h-[40px] aspect-square rounded-full"/>
                            <p className="font-medium">{user.name}</p>
                        </Link>
                    ))}
                    </div>
                    }
                </div>}
        </div>
    )
}