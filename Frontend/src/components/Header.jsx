import { Link, useNavigate } from "react-router";
import useAuthStore from "../stores/authStore";
import { useRef, useState, useEffect } from "react";
import ProfilePopup from "./ProfilePopup";
import { MenuIcon, Bell } from "lucide-react";
import SearchBar from "./SearchBar";
import Notifications from "./Notifications";


export default function Header({ isMenuOpen, setIsMenuOpen, btnRef, showPopup, setShowPopup, setShowSettings, notifications, setNotifications }) {
    const { user, isAuthenticated, checkAuth } = useAuthStore();
    const profileRef = useRef(null);
    const navigate = useNavigate();
    const profileImage = user ? import.meta.env.VITE_BACKEND_URL + "/api" + user.profileImage : import.meta.env.VITE_BACKEND_URL + "/api" + "/assets/default-profile.png";
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("touchstart", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("touchstart", handleOutsideClick);
        };

    }, [])

    return (
        <div className="h-[60px] flex justify-between items-center  p-2 w-full sm:w-[95%] mx-auto mb-4 backdrop-blur-sm sm:gap-4 ">
            <div className="flex gap-4 sm:gap-8 justify-center">
                <div className="flex justify-center items-center">
                    <button
                        className="focus:outline-none mr-1"
                        onClick={() => {
                            setIsMenuOpen(!isMenuOpen)
                        }}
                        ref={btnRef}
                        aria-label="Toggle menu"
                    >
                        <MenuIcon />
                    </button>
                    <Link className="text-2xl font-bold" to="/">{
                        <h1>
                            <span className="text-2xl font-bold border-2-white glow-black dark:glow-white">BlogHub</span></h1>
                    }</Link>
                </div>

                <SearchBar />
            </div>


            <div className="flex gap-8 justify-center">
                <div ref={notifRef} className="relative flex justify-center">
                    <button className={`${showNotif ? "outline-4 outline-gray-500/40" : ""} rounded-full hover:outline-4 hover:outline-gray-500/40 aspect-square flex justify-center items-center p-0 relative`} onClick={() => setShowNotif(p => !p)}>
                        <Bell />
                        {notifications.length > 0 && <p className="absolute top-0 right-0 bg-red-700 text-white px-2 aspect-square rounded-full text-[0.7rem] flex justify-center items-center">{notifications.length}</p>}
                    </button>
                    {showNotif && <Notifications {...{ notifications, setNotifications, setShowNotif }} />}
                </div>

                <div className="flex justify-center items-center gap-3 relative">
                    <button ref={profileRef} className="" onClick={async () => {
                        if (isAuthenticated) {
                            setShowPopup(v => !v);
                            return;
                        }
                        navigate("/login")
                    }}>
                        <img
                            className="rounded-full aspect-square h-[40px] w-[40px] hover:outline-4 hover:outline-gray-500/40"
                            src={profileImage}
                        />
                    </button>
                    {isAuthenticated && showPopup && <ProfilePopup {...{ name: user.name, profileImage, setShowPopup, profileRef, setShowSettings }} />}
                </div>
            </div>

        </div>
    )
}