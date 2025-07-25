import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, Compass, Calendar, Users, Gift, Bug, Bell, EllipsisVertical, UserPlus, User, Settings, LogOut, UsersRound, BookOpenText, EthernetPort } from "lucide-react";
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


const menu = [
    { icon: <Home size={18} />, label: "Home", path: "/instructor/dashboard" },
    { icon: <BookOpen size={18} />, label: "Upload Courses", path: "/instructor/courses" },
    // { icon: <UsersRound size={18} />, label: "Student Enrollment", path: "/instructor/enrollments" },
    // { icon: <BookOpenText size={18} />, label: "Create Guide", path: "/instructor/create-guide" },
    // { icon: <EthernetPort size={18} />, label: "Add Workshop", path: "/instructor/add-workshop" },
    // { icon: <UsersRound size={18} />, label: "Users", path: "/instructor/users" },
    // { icon: <Gift size={18} />, label: "Perks", path: "/admin/perks" },
];

const InstructorSidebar = () => {
    // --- NEW: State for popup visibility and user data ---
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState(null);
    const popupRef = useRef(null);
    const navigate = useNavigate();

    // --- NEW: Effect to fetch the logged-in admin's data ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then(docSnap => {
                    if (docSnap.exists()) {
                        setAdminProfile(docSnap.data());
                    }
                });
            } else {
                setAdminProfile(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // --- NEW: Effect to handle clicks outside the popup to close it ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setIsPopupOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- NEW: Logout function ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    // --- NEW: Define styles for active and inactive links ---
    const activeLinkStyle = "flex items-center gap-3 text-[15px] font-semibold bg-gray-200 text-black p-2 rounded-lg";
    const inactiveLinkStyle = "flex items-center gap-3 text-[15px] text-gray-700 hover:text-black p-2";

    return (
        <div className="bg-[#FAFAFA] fixed border border-r-[#E3E3E3] border-b-0 border-t-0 h-screen w-[300px] p-4 lg:flex flex-col justify-between top-0 left-0 z-50 overflow-x-hidden hidden">
            <div>
                <div className="text-xl font-bold mb-6 ">
                    <span className="text-black">Instructor</span>
                    <span className="text-purple-600"> Panel</span>
                </div>
                <div>
                    <input type="search" placeholder="Search..." className="border border-gray-300 bg-[#E9E9E9] rounded-md p-2 w-full" />
                </div>

                <div className="flex flex-col gap-4 p-4 mt-6">
                    {/* --- UPDATED: Using NavLink for active styling --- */}
                    {menu.map((item, i) => (
                        <NavLink
                            key={i}
                            to={item.path}
                            className={({ isActive }) => isActive ? activeLinkStyle : inactiveLinkStyle}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </div>
            </div>
            
            {/* The bottom section of the sidebar */}
            <div className="relative" ref={popupRef}>
                <div className="flex items-center mt-6">
                    <div className="flex items-center gap-3 flex-1">
                        {/* --- UPDATED: Dynamic profile picture and name --- */}
                        <img 
                            src={adminProfile?.profilePicUrl || "https://placehold.co/40x40/E3E3E3/000000?text=A"} 
                            alt={adminProfile?.name || "Admin"}
                            className='w-[40px] h-[40px] rounded-full object-cover' 
                        />
                         <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{adminProfile?.name || 'Admin User'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* --- UPDATED: Ellipsis icon is now a button to toggle the popup --- */}
                        <button onClick={() => setIsPopupOpen(prev => !prev)} className="p-2 hover:bg-gray-200 rounded-full">
                            <EllipsisVertical />
                        </button>
                    </div>
                </div>

                {/* --- NEW: The popup menu, conditionally rendered --- */}
                {isPopupOpen && (
                    <div className="absolute bottom-full mb-2 right-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
                        <Link to="/instructor/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                            <User size={16} /> My Profile
                        </Link>
                        <div className="my-1 border-t border-gray-100"></div>
                        <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                            <LogOut size={16} /> Log out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorSidebar;
