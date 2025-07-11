import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, Compass, Calendar, Users, Gift, Bug, Bell, EllipsisVertical, User, BarChart2, Bookmark, Sun, Settings, LogOut } from "lucide-react";
import { NavLink, useNavigate } from 'react-router-dom'; 
import { auth, db } from '../../lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const menu = [
    { icon: <Home size={18} />, label: "Home", path: "/student/dashboard" },
    { icon: <BookOpen size={18} />, label: "Courses", path: "/student/courses" },
    { icon: <Compass size={18} />, label: "Guides", path: "/student/guides" },
    { icon: <Calendar size={18} />, label: "Workshops", path: "/student/workshops" },
    // { icon: <Users size={18} />, label: "Events", path: "/student/events" },
    { icon: <User size={18} />, label: "My Profile", path: "/student/profile" },
    { icon: <Gift size={18} />, label: "Perks", path: "/student/perks" },
];


const SideBar = ({ onSearchChange }) => {
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // 
    const userPopupRef = useRef(null);
    const notificationPopupRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data());
                    }
                });

                const notificationsQuery = query(collection(db, 'notifications'), where("userId", "==", user.uid));
                const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
                    const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setNotifications(notificationsData);
                });

                return () => {
                    unsubscribeProfile();
                    unsubscribeNotifications();
                };
            } else {
                setUserProfile(null);
                setNotifications([]);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // --- Effect to handle clicks outside the popups ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userPopupRef.current && !userPopupRef.current.contains(event.target)) {
                setIsUserPopupOpen(false);
            }
            if (notificationPopupRef.current && !notificationPopupRef.current.contains(event.target)) {
                setIsNotificationPopupOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (onSearchChange) {
            onSearchChange(e.target.value);
        }
    };

    // --- Logout function ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

   
    const activeLinkStyle = "flex items-center gap-3 text-[15px] font-semibold bg-gray-200 text-black p-2 rounded-lg";
    const inactiveLinkStyle = "flex items-center gap-3 text-[15px] text-gray-700 hover:text-black p-2";

    return (
        <div className="bg-[#FAFAFA] fixed border border-r-[#E3E3E3] border-b-0 border-t-0 h-screen w-[300px] p-4 lg:flex flex-col justify-between top-0 left-0 z-50 overflow-x-hidden sm:hidden md:hidden hidden">
            <div>
                <div className="text-xl font-bold mb-6 m-auto text-center">
                    <span className="text-black">AI</span>
                    <span className="text-purple-600"> School </span>
                </div>
                <div>
                    
                    <input 
                        type="search" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="border border-gray-300 bg-[#E9E9E9] rounded-md p-2 w-full" 
                    />
                </div>

                <div className="flex flex-col gap-2 p-2 mt-6">
                    
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
            <div className="text-sm text-gray-600">
                <div className="mb-2">
                    <div className="flex items-center justify-between bg-[#E9E9E9] p-4 mb-9 rounded">
                        <span>Get started</span>
                        <span className="text-xs font-medium text-purple-600">67%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded mb-10">
                        <div className="w-[67%] h-full bg-purple-600 rounded" />
                    </div>
                </div>
                <button className="flex mb-10 text-[15px] text-gray-700 hover:underline">
                    <Bug className='mr-1' size={18} />Report a problem
                </button>
            </div>
            
            <div className="relative">
                <div className="flex items-center">
                    <div className="flex items-center gap-3 flex-1">
                        <img 
                            src={userProfile?.profilePicUrl || "https://placehold.co/40x40/E3E3E3/000000?text=U"} 
                            alt={userProfile?.name || "User"}
                            className='w-[40px] h-[20px] rounded-full object-cover' 
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{userProfile?.name || 'Guest User'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative" ref={notificationPopupRef}>
                            <button onClick={() => setIsNotificationPopupOpen(prev => !prev)} className="p-2 hover:bg-gray-200 rounded-full relative">
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                                )}
                            </button>
                            {isNotificationPopupOpen && (
                                <div className="absolute bottom-full mb-2 right-0 w-[210px] bg-white rounded-lg shadow-lg border border-gray-200 p-2 max-h-96 overflow-y-auto">
                                    <div className="p-2 font-semibold text-sm">Notifications</div>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div key={notif.id} className="p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                                <p className="font-bold">{notif.title}</p>
                                                <p>{notif.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-gray-500 text-center">No new notifications</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={userPopupRef}>
                            <button onClick={() => setIsUserPopupOpen(prev => !prev)} className="p-2 hover:bg-gray-200 rounded-full">
                                <EllipsisVertical size={20} />
                            </button>
                            {isUserPopupOpen && (
                                <div className="absolute bottom-full mb-2 right-0 w-60 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                                    <Link to="/student/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <User size={16} /> My profile
                                    </Link>
                                    <Link to="/student/progress" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <BarChart2 size={16} /> My Learning
                                    </Link>
                                    {/* <Link to="/student/saved" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Bookmark size={16} /> Saved
                                    </Link> */}
                                    <div className="my-1 border-t border-gray-100"></div>
                                    {/* <button className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Sun size={16} /> Theme: Light
                                    </button> */}
                                    <button className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                                        <Settings size={16} /> Support
                                    </button>
                                    <div className="my-1 border-t border-gray-100"></div>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                                        <LogOut size={16} /> Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SideBar;
