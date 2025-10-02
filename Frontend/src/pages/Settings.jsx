import { X } from "lucide-react";
import { useEffect, useRef } from "react";

export default function Settings({ darkMode, setDarkMode, setShowSettings }) {
    const setRef = useRef(null);

    useEffect(() => {
            const handleOutsideClick = (e) => {
                if (setRef.current && !setRef.current.contains(e.target)) {
                    setShowSettings(false);
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
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-gray-700/50 z-999">
            <button className="fixed right-2 top-2" onClick={()=>setShowSettings(false)}><X size={20}/></button>

            <div ref={setRef} className="container w-fit rounded-2xl bg-white dark:bg-[#1E1E1E]">
                <div className="flex items-center space-x-10 p-4">
                    <span className="text-gray-900 dark:text-white">Dark Mode</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={darkMode}
                            onChange={(e) => setDarkMode(e.target.checked)}
                        />
                        <div className="peer w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:bg-gray-600 dark:peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div>

                </div>
            </div>

        </div>
    )
}