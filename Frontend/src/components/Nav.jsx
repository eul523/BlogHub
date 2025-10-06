import { NavLink, Link } from "react-router-dom";
import { useRef, useEffect } from "react";
import { Home as HomeIcon, User, Star, MenuIcon, Settings } from "lucide-react";

export default function Nav({ isMenuOpen, setIsMenuOpen, btnRef, setShowSettings }) {
    const navRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (navRef.current && !navRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
                setIsMenuOpen(false);
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
        <div className={`w-full fixed top-0 p-0 h-full z-999 bg-white/10 backdrop-blur-sm transition-opacity duration-500  ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}>
            <div className={`z-50 p-2 pr-10 shadow-xl  w-fit h-full  opacity-100 dark:bg-[#1E1E1E] dark:shadow-0 fixed top-0 bg-white left-0 transform transition-transform duration-500 ease-in-out  ${isMenuOpen ? 'translate-x-0 delay-100' : '-translate-x-full'
                }`}>
                <div className="flex justify-between w-fit px-2 sm:px-6 h-[50px] items-center">
                    <button
                        className="focus:outline-none mr-1"
                        onClick={() => {
                            setIsMenuOpen(p=>!p)
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
                <nav ref={navRef}>

                    <div className="flex flex-col pl-4 space-y-4 mx-4 my-4 ">

                        <div className="w-full flex flex-col space-y-3 ">
                            <NavLink
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => `hover:text-black hover:dark:text-white ${isActive ? "text-black dark:text-white" : "text-gray-500"} w-full font-medium flex justify-start items-center gap-2`} to="/"><HomeIcon className="inline" size={20} />Home</NavLink>

                            <NavLink
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => `hover:text-black hover:dark:text-white ${isActive ? "text-black dark:text-white" : "text-gray-500"} w-full font-medium flex justify-start items-center gap-2`} to="/me"><User className="inline" size={20} />Profile</NavLink>

                            <NavLink
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => `hover:text-black hover:dark:text-white ${isActive ? "text-black  dark:text-white" : "text-gray-500"} w-full font-medium flex justify-start items-center gap-2`}
                                to="/favourites">
                                <Star className="inline" size={20} />Favourites
                            </NavLink>

                            <button
                                onClick={() => { setIsMenuOpen(false); setShowSettings(true) }}
                                className="hover:text-black hover:dark:text-white text-gray-500 w-full font-medium flex justify-start items-center gap-2"
                            >
                                <Settings className="inline" size={20} />Settings
                            </button>
                        </div>

                    </div>

                </nav>
            </div>
        </div>

    )
}