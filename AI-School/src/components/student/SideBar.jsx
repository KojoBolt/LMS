import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, Compass, Calendar, Users, Gift, Bug, Bell, EllipsisVertical, User, BarChart2, Bookmark, Sun, Moon, Settings, LogOut, TrainFrontTunnel } from "lucide-react";
import { NavLink, useNavigate } from 'react-router-dom'; 
import { auth, db } from '../../lib/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import SideLogo from '../../assets/images/logoblack.png'; 
import { useTheme } from '../../context/ThemeContext';
import SideLogoDark from '../../assets/images/logoai.png';

const menu = [
    { icon: <Home size={18} />, label: "Home", path: "/student/dashboard" },
    { icon: <BookOpen size={18} />, label: "Courses", path: "/student/courses" },
    { icon: <Compass size={18} />, label: "Guides", path: "/student/guides" },
    { icon: <Calendar size={18} />, label: "Workshops", path: "/student/workshops" },
    { icon: <User size={18} />, label: "My Profile", path: "/student/profile" },
    { icon: <Gift size={18} />, label: "Perks", path: "/student/perks" },
    { icon: <TrainFrontTunnel size={18} />, label: "Skuler", path: "/student/skuler" },
];

const SideBar = ({ onSearchChange }) => {
    const [isUserPopupOpen, setIsUserPopupOpen] = useState(false);
    const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const userPopupRef = useRef(null);
    const notificationPopupRef = useRef(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme(); 

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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    // Theme-aware styles
    const sidebarBg = theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-100';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-[#E3E3E3]';
    const textPrimary = theme === 'dark' ? 'text-white' : 'text-black';
    const textSecondary = theme === 'dark' ? 'text-white' : 'text-gray-700';
    const searchBg = theme === 'dark' ? 'bg-[#3B3B3B] border-gray-600' : 'bg-[#E9E9E9] border-gray-300';
    const popupBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const popupBorder = theme === 'dark' ? 'border-[#3B3B3B]' : 'border-gray-200';
    const hoverBg = theme === 'dark' ? 'hover:bg-gray-500' : 'hover:bg-gray-100';
    const activeBg = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
    const buttonHoverBg = theme === 'dark' ? 'hover:bg-[#3B3B3B]' : 'hover:bg-gray-200';
    

    const activeLinkStyle = `flex items-center gap-3 text-[15px] font-semibold ${activeBg} ${textPrimary} p-2 rounded-lg`;
    const inactiveLinkStyle = `flex items-center gap-3 text-[15px] ${textSecondary} hover:text-black p-2`;

    return (
        <div className={`${sidebarBg} fixed border-b-0 border-t-0 h-screen w-[300px] p-4 lg:flex flex-col justify-between top-0 left-0 z-50 overflow-x-hidden sm:hidden md:hidden hidden border border-r-gray-300`}>
            <div>
                <div className="mb-8 text-center">
                    {theme === 'dark' ? (
                        <img src={SideLogoDark} alt="logo" className='w-24 h-12 m-auto' />
                    ) : (
                        <img src={SideLogo} alt="logo" className='w-24 h-12 m-auto' />
                    )}
            </div>
                <div>
                    <input 
                        type="search" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={`border ${searchBg} rounded-md p-2 w-full ${textPrimary} placeholder-gray-500`}
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
            
            <div className={`text-sm ${textSecondary}`}>
                <div className="mb-2">
                    <div className={`flex items-center justify-between ${searchBg} p-4 mb-9 rounded`}>
                        <span>Get started</span>
                    </div>
                </div>
                <button className={`flex mb-10 text-[15px] ${textSecondary} hover:underline`}>
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
                            <p className={`font-semibold truncate ${textPrimary}`}>{userProfile?.name || 'Guest User'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative" ref={notificationPopupRef}>
                            <button onClick={() => setIsNotificationPopupOpen(prev => !prev)} className={`p-2 ${buttonHoverBg} rounded-full relative`}>
                                <Bell size={20} className={textPrimary} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
                                )}
                            </button>
                            {isNotificationPopupOpen && (
                                <div className={`absolute bottom-full mb-2 right-0 w-[210px] ${popupBg} rounded-lg shadow-lg border ${popupBorder} p-2 max-h-96 overflow-y-auto`}>
                                    <div className={`p-2 font-semibold text-sm ${textPrimary}`}>Notifications</div>
                                    <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-100'} my-1`}></div>
                                    {notifications.length > 0 ? (
                                        notifications.map(notif => (
                                            <div key={notif.id} className={`p-2 text-sm ${textSecondary} ${hoverBg} rounded-md`}>
                                                <p className={`font-bold ${textPrimary}`}>{notif.title}</p>
                                                <p>{notif.message}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={`p-2 text-sm ${textSecondary} text-center`}>No new notifications</div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={userPopupRef}>
                            <button onClick={() => setIsUserPopupOpen(prev => !prev)} className={`p-2 ${buttonHoverBg} rounded-full`}>
                                <EllipsisVertical size={20} className={textPrimary} />
                            </button>
                            {isUserPopupOpen && (
                                <div className={`absolute bottom-full mb-2 right-0 w-60 ${popupBg} rounded-lg shadow-lg border ${popupBorder} p-2`}>
                                    <Link to="/student/profile" className={`flex items-center gap-3 px-3 py-2 text-sm ${textSecondary} ${hoverBg} rounded-md`}>
                                        <User size={16} /> My profile
                                    </Link>
                                    <Link to="/student/progress" className={`flex items-center gap-3 px-3 py-2 text-sm ${textSecondary} ${hoverBg} rounded-md`}>
                                        <BarChart2 size={16} /> My Learning
                                    </Link>
                                    <div className={`my-1 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-100'}`}></div>
                                    <button onClick={toggleTheme} className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm ${textSecondary} ${hoverBg} rounded-md`}>
                                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} 
                                        Theme: {theme === 'light' ? 'Light' : 'Dark'}
                                    </button>
                                    <button className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm ${textSecondary} ${hoverBg} rounded-md`}>
                                        <Settings size={16} /> Support
                                    </button>
                                    <div className={`my-1 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-100'}`}></div>
                                    <button onClick={handleLogout} className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm text-red-600 ${theme === 'dark' ? 'hover:bg-red-900' : 'hover:bg-red-50'} rounded-md`}>
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