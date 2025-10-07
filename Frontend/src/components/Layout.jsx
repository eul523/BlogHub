import { useState, useRef, useEffect } from "react";
import Header from "./Header.jsx";
import Nav from "./Nav.jsx";
import { Outlet, useNavigation } from "react-router";
import CircularProgress from '@mui/material/CircularProgress';
import Settings from "../pages/Settings.jsx";
import { Toaster } from "react-hot-toast";
import api from "../api/api.js";
import useAuthStore from "../stores/authStore.js";

const isDarkModeStored = window.localStorage.getItem('isDarkMode');
const isDarkMode =
  isDarkModeStored === 'true' || isDarkModeStored === 'false'
    ? isDarkModeStored === 'true'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

export default function Layout() {
    const [darkMode, setDarkMode] = useState(Boolean(isDarkMode));
    const btnRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);
    const [showSettings, setShowSettings] = useState(false);
    const [notifications, setNotifications]  = useState([]);
    const { isAuthenticated } = useAuthStore();

    const toggleDarkMode = () => {
        window.localStorage.setItem("isDarkMode", String(!darkMode));
        setDarkMode(p=>!p);

    }

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.remove("dark-mode");
        }
    }, [darkMode]);

    useEffect(()=>{
        const fetchNotifs = async () => {
            if(!isAuthenticated)return;
            try{
                const data = await api.get("/notifications");
                if(JSON.stringify(data.data) !== JSON.stringify(notifications))setNotifications(data.data);
            }catch(err){

            }
        }
        fetchNotifs();

        const interval = setInterval(fetchNotifs, 10000);

        return () => clearInterval(interval);
    }, [])

    return (
        <>
            <div className="m-0 p-0 box-border max-w-full overflow-x-hidden sm:overflow-x-visible min-h-[100vh]">

                <header className="sticky top-0 z-40 shadow-xl">
                    <Header {...{ isMenuOpen, setIsMenuOpen, btnRef, setShowPopup, showPopup, setShowSettings, notifications, setNotifications }} />
                </header>
                <Toaster/>

                <Nav {...{ isMenuOpen, setIsMenuOpen, btnRef, setShowPopup, setShowSettings }} />
                {isNavigating && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
                        <CircularProgress />
                    </div>
                )}
                {showSettings && 
                  <Settings {...{darkMode,toggleDarkMode, setShowSettings}}/>
                }
                <Outlet />
            </div>
        </>

    )
}