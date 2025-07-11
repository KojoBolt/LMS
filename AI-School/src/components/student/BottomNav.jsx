import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, BookOpen, Compass, Briefcase, MoreHorizontal, Users, Gift, Settings, LogOut } from 'lucide-react';


const mainMenuItems = [
    { icon: <Home size={24} />, label: "Home", path: "/student/dashboard" },
    { icon: <BookOpen size={24} />, label: "Courses", path: "/student/courses" },
    { icon: <Compass size={24} />, label: "Guides", path: "/student/guides" },
    { icon: <Briefcase size={24} />, label: "Workshops", path: "/student/workshops" },
];


const moreMenuItems = [
    { icon: <Users size={18} />, label: "Community", path: "/student/community" },
    { icon: <Gift size={18} />, label: "Perks", path: "/student/perks" },
    { icon: <Settings size={18} />, label: "Settings", path: "/student/profile" },
];

const BottomNav = () => {
   
    const [isMorePopupOpen, setIsMorePopupOpen] = useState(false);
    const morePopupRef = useRef(null);

    const activeLinkStyle = "flex flex-col items-center text-white";
    const inactiveLinkStyle = "flex flex-col items-center text-gray-400 hover:text-white transition-colors duration-200";


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (morePopupRef.current && !morePopupRef.current.contains(event.target)) {
                setIsMorePopupOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black z-40 border-t border-black-200 shadow-lg">
            <div className="flex justify-around items-center p-2">
                
                {mainMenuItems.map((item, i) => (
                    <NavLink
                        key={i}
                        to={item.path}
                        className={({ isActive }) => (isActive ? activeLinkStyle : inactiveLinkStyle) + ' w-full text-center py-1'}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </NavLink>
                ))}

                <div className="relative w-full text-center" ref={morePopupRef}>
                    <button
                        onClick={() => setIsMorePopupOpen(prev => !prev)}
                        className={`${isMorePopupOpen ? activeLinkStyle : inactiveLinkStyle} w-full py-1`}
                    >
                        <MoreHorizontal size={24} />
                        <span className="text-xs mt-1">More</span>
                    </button>

                    
                    {isMorePopupOpen && (
                        <div className="absolute bottom-full mb-4 right-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
                            {moreMenuItems.map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.path}
                                    onClick={() => setIsMorePopupOpen(false)} 
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BottomNav;
