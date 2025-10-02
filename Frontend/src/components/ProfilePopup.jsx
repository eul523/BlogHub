import { Link, useNavigate } from "react-router";
import { LogOut, Pen, Settings} from "lucide-react";
import { useRef, useEffect } from "react";
import useAuthStore from "../stores/authStore";

export default function ProfilePopup({name, profileImage, setShowPopup, profileRef, setShowSettings}){

    const popupRef = useRef(null);
    const { logout, error } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try{
            await logout();
            navigate("/");
        }catch(err){

        }
    }
    
        useEffect(() => {
            const handleOutsideClick = (e) => {
                if (popupRef.current && !popupRef.current.contains(e.target) && profileRef.current && !profileRef.current.contains(e.target)) {
                    setShowPopup(false);
                }
            }
            document.addEventListener("mousedown", handleOutsideClick);
            document.addEventListener("touchstart", handleOutsideClick);
    
            return () => {
                document.removeEventListener("mousedown", handleOutsideClick);
                document.removeEventListener("touchstart", handleOutsideClick);
            };
    
        }, [])

    return(
        <div ref={popupRef} className="absolute right-0 top-[50px] mt-2 w-56 rounded-2xl bg-white dark:bg-[#1E1E1E] shadow-lg ring-1 ring-black/10 z-50 flex flex-col p-4 space-y-4 dark:border dark:border-gray-600">
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Link onClick={()=>setShowPopup(false)} to="/me" className="flex justify-start gap-4 items-center">
                <img className="rounded-full w-[60px] aspect-square" src={profileImage}/>
                <div>
                    <p>{name}</p>
                    <p className="text-sm text-gray-500">View profile</p>
                </div>
                
            </Link>
            <Link className="hover:text-black hover:dark:text-white text-gray-500 w-full font-medium flex justify-start items-center gap-2" onClick={()=>setShowPopup(false)} to="/create-post"><Pen size={20}/>Write</Link>
            <button className="hover:text-black hover:dark:text-white text-gray-500 w-full font-medium flex justify-start items-center gap-2" 
                onClick={()=>{setShowPopup(false);setShowSettings(p=>!p)}}>
                <Settings size={20}/>Settings
            </button>
            <button className="hover:text-black hover:dark:text-white text-gray-500 w-full font-medium flex justify-start items-center gap-2" onClick={()=>{setShowPopup(false);handleLogout();}} to="/signout"><LogOut size={20}/>Sign out</button>
        </div>
    )
}