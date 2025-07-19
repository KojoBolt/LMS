import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, User } from 'lucide-react';
import { auth, db } from '../../lib/firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import SideLogo from '../../assets/images/logoblack.png'; 
import { useTheme } from '../../context/ThemeContext';
import SideLogoDark from '../../assets/images/logoai.png'


const MobileHeader = () => {
    const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);
    const notificationPopupRef = useRef(null);
    const { theme } = useTheme();
    

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const notificationsQuery = query(collection(db, 'notifications'), where("userId", "==", user.uid));
            const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
                const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setNotifications(notificationsData);
            });
            return () => unsubscribe();
        } else {
            setNotifications([]);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationPopupRef.current && !notificationPopupRef.current.contains(event.target)) {
                setIsNotificationPopupOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const containerBg = theme === 'dark' ? 'bg-black' : 'bg-white';

    return (
        <div className={`lg:hidden fixed top-0 left-0 right-0 ${containerBg} shadow-sm p-3 z-40  border-b border-b-[#3B3B3B]`}>
            <div className="flex justify-between items-center">
                
                <div className="text-xl font-bold">
                    {/* <span className="text-gray-800">The AI</span>
                    <span className="text-purple-600">School</span> */}
                <div className=" text-center">
                      {theme === 'dark' ? (
                        <img src={SideLogoDark} alt="logo" className='w-18 h-10 ' />
                                ) : (
                           <img src={SideLogo} alt="logo" className='w-18 h-10 ' />
                             )}
                </div>
                </div>

                
                <div className="flex items-center space-x-4">
                    {/* <Search size={22} className="text-gray-600" /> */}
                    
                    
                    <div className="relative" ref={notificationPopupRef}>
                        <button onClick={() => setIsNotificationPopupOpen(prev => !prev)} className="relative">
                            <Bell size={22} className="text-gray-600" />
                            {notifications.length > 0 && (
                                <span className="absolute top-0 right-0 h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                            )}
                        </button>
                        {isNotificationPopupOpen && (
                            <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-2 max-h-96 overflow-y-auto">
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

                    <Link to="/student/profile">
                        <User size={22} className="text-gray-600" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default MobileHeader;
