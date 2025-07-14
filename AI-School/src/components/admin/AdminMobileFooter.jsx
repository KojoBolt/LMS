import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, MoreHorizontal, UserPlus, FileText, Settings,LogOut } from 'lucide-react';
import { auth } from '../../lib/firebaseConfig';
import { signOut } from 'firebase/auth';

const mainAdminMenuItems = [
    { icon: <LayoutDashboard size={24} />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <BookOpen size={24} />, label: "Courses", path: "/admin/courses" },
    { icon: <Users size={24} />, label: "Students", path: "/admin/enrollments" },
];

const moreMenuItems = [
    { icon: <UserPlus size={18} />, label: "Create Guide", path: "/admin/create-guide" },
    { icon: <FileText size={18} />, label: "Add Workshop", path: "/admin/add-workshop" },
    { icon: <Settings size={18} />, label: "Profile", path: "/admin/profile" },
];

const AdminMobileFooter = () => {
    const [isMorePopupOpen, setIsMorePopupOpen] = useState(false);
    const morePopupRef = useRef(null);
    const navigate = useNavigate(); 

    const activeLinkStyle = "flex flex-col items-center text-gray-600";
    const inactiveLinkStyle = "flex flex-col items-center text-white";
    
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
    const handleLogout = async () => {
            try {
                await signOut(auth);
                setIsMorePopupOpen(false);
                navigate('/login');
            } catch (error) {
                console.error("Error signing out: ", error);
            }
        };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black shadow-lg z-40 border-t border-gray-200">
            <div className="flex justify-around items-center p-2">
                {/* Map over the main menu items */}
                {mainAdminMenuItems.map((item, i) => (
                    <NavLink
                        key={i}
                        to={item.path}
                        className={({ isActive }) => (isActive ? activeLinkStyle : inactiveLinkStyle) + ' w-full text-center py-1'}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </NavLink>
                ))}

                {/* The "More" item is a button that toggles the popup */}
                <div className="relative w-full text-center" ref={morePopupRef}>
                    <button
                        onClick={() => setIsMorePopupOpen(prev => !prev)}
                        className={`${isMorePopupOpen ? activeLinkStyle : inactiveLinkStyle} w-full py-1`}
                    >
                        <MoreHorizontal size={24} />
                        <span className="text-xs mt-1">More</span>
                    </button>

                    {isMorePopupOpen && (
                        <div className="absolute bottom-full mb-4 right-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50">
                            {moreMenuItems.map((item, i) => (
                                <Link
                                    key={i}
                                    to={item.path}
                                    onClick={() => setIsMorePopupOpen(false)} // Close popup on click
                                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                            <div className="my-1 border-t border-gray-100"></div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                            >
                                <LogOut size={16} />
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMobileFooter;
