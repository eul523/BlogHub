import { Link, useNavigate } from "react-router";
import useAuthStore from "../stores/authStore";
import { useRef } from "react";
import ProfilePopup from "./ProfilePopup";
import { MenuIcon, X } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Header({ isMenuOpen, setIsMenuOpen, btnRef, showPopup, setShowPopup }) {
    const {user, isAuthenticated} = useAuthStore();
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const profileImage = user ? import.meta.env.VITE_BASE_URL+user.profileImage : import.meta.env.VITE_BASE_URL+"/images/default-profile-image";


    return (
        <div className="h-[60px] text-black flex justify-between items-center  p-2">
            <div className="flex justify-between">
                <button
                    className="focus:outline-none mr-1"
                    onClick={() => {
                        setIsMenuOpen(!isMenuOpen)
                    }}
                    ref={btnRef}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X/> : <MenuIcon/>}
                </button>
                <Link className="text-2xl font-bold" to="/">BlogApp</Link>
            </div>

            <SearchBar/>

            <div className="flex justify-center items-center gap-3 relative">
                <button ref={profileRef} className="" onClick={()=>isAuthenticated ? setShowPopup(v=>!v) : navigate("/login")}>
                    <img
                        className="rounded-full h-[40px] w-[40px] hover:outline-8 hover:outline-[#dcd2d282]"
                        src={profileImage}
                    />
                </button>
                {isAuthenticated && showPopup && <ProfilePopup {...{name:user.name,profileImage, setShowPopup, profileRef}}/>}
            </div>

        </div>
    )
}