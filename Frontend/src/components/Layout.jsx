import { useState, useRef, useEffect } from "react";
import Header from "./Header.jsx";
import Nav from "./Nav.jsx";
import { Outlet, useNavigation } from "react-router";
import Notifications from "./Notification.jsx";
import CircularProgress from '@mui/material/CircularProgress';
import Settings from "../pages/Settings.jsx";


export default function Layout() {
    const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const [darkMode, setDarkMode] = useState(isDarkMode);
    const btnRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.add("dark-mode");
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.remove("dark-mode");
        }
    }, [darkMode]);

    return (
        <>
            <div className="m-0 p-0 box-border">

                <header className="sticky top-0 z-40 shadow-xl">
                    <Header {...{ isMenuOpen, setIsMenuOpen, btnRef, setShowPopup, showPopup, setShowSettings }} />
                </header>
                <Notifications />

                <Nav {...{ isMenuOpen, setIsMenuOpen, btnRef, setShowPopup, setShowSettings }} />
                {isNavigating && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
                        <CircularProgress />
                    </div>
                )}
                {showSettings && 
                  <Settings {...{darkMode,setDarkMode, setShowSettings}}/>
                }
                <Outlet />
            </div>
        </>

    )
}