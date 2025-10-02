import { useState, useRef } from "react";
import Header from "./Header.jsx";
import Nav from "./Nav.jsx";
import { Outlet, useNavigation } from "react-router";
import Notifications from "./Notification.jsx";
import CircularProgress from '@mui/material/CircularProgress';


export default function Layout() {
    const btnRef = useRef(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const navigation = useNavigation();
    const isNavigating = Boolean(navigation.location);

    return (
        <>
            <div className="m-0 p-0 box-border">

                <header className="sticky top-0 z-40 bg-white shadow-xl">
                    <Header {...{ isMenuOpen, setIsMenuOpen, btnRef, setShowPopup, showPopup }} />
                </header>
                <Notifications />

                <Nav {...{ isMenuOpen, setIsMenuOpen, btnRef, setShowPopup }} />
                {isNavigating && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
                        <CircularProgress />
                    </div>
                ) }
                <Outlet />
            </div>
        </>

    )
}