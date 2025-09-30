import { NavLink } from "react-router-dom";
import { useRef, useEffect } from "react";
import { Home as HomeIcon, User } from "lucide-react";

export default function Nav({ isMenuOpen, setIsMenuOpen, btnRef }) {
    const navRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (navRef.current && !navRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target) ) {
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
        <>
            <nav ref={navRef}
                className={`z-50 shadow-xl p-0 fixed top-[60px] h-full w-64 left-0 bg-white  opacity-100 text-black transform transition-transform duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >

                <div className="flex flex-col space-y-4 mx-4 my-4 ">

                    <div className="w-full flex flex-col space-y-3 ">
                        <NavLink 
                        onClick={()=>setIsMenuOpen(false)}
                        className={({isActive})=>`hover:text-black ${isActive ? "text-black" : "text-gray-500"} w-full font-medium flex justify-start items-center gap-2`} to="/"><HomeIcon className="inline" size={20}/>Home</NavLink>
                        <NavLink 
                        onClick={()=>setIsMenuOpen(false)}
                        className={({isActive})=>`hover:text-black ${isActive ? "text-black" : "text-gray-500"} w-full font-medium flex justify-start items-center gap-2`} to="/me"><User className="inline" size={20}/>Profile</NavLink>
                    </div>

                </div>

            </nav>
        </>
    )
}