import { Link, useNavigate } from "react-router";
import useAuthStore from "../stores/authStore";
import { useRef, useEffect } from "react";
import ProfilePopup from "./ProfilePopup";
import { MenuIcon, X } from "lucide-react";
import SearchBar from "./SearchBar";
import { useState } from "react";


export default function Header({ isMenuOpen, setIsMenuOpen, btnRef, showPopup, setShowPopup, setShowSettings }) {
    const {user, isAuthenticated, checkAuth} = useAuthStore();
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const profileImage = user ? import.meta.env.VITE_BASE_URL+user.profileImage : import.meta.env.VITE_BASE_URL+"/images/default-profile-image";

    return (
        <div className="h-[60px] flex justify-between items-center  p-2 mb-4 w-full backdrop-blur-sm">
            <div className="flex justify-between">
                <button
                    className="focus:outline-none mr-1"
                    onClick={() => {
                        setIsMenuOpen(!isMenuOpen)
                    }}
                    ref={btnRef}
                    aria-label="Toggle menu"
                >
                    <MenuIcon/>
                </button>
                <Link className="text-2xl font-bold" to="/">{
                    <h1>
                        <span className="text-2xl font-bold border-2-white glow-black dark:glow-white">BlogHub</span></h1>
                }</Link>
            </div>

            <SearchBar/>

            <div className="flex justify-center items-center gap-3 relative">
                <button ref={profileRef} className="" onClick={async ()=>{
                    if(isAuthenticated){
                        setShowPopup(v=>!v);
                        return;
                    }
                    await checkAuth();
                    if(isAuthenticated)setShowPopup(v=>!v);
                    else navigate("/login")
                }}>
                    <img
                        className="rounded-full h-[40px] w-[40px] hover:outline-4 hover:outline-[#dcd2d282]"
                        src={profileImage}
                    />
                </button>
                {isAuthenticated && showPopup && <ProfilePopup {...{name:user.name,profileImage, setShowPopup, profileRef, setShowSettings}}/>}
            </div>

        </div>
    )
}