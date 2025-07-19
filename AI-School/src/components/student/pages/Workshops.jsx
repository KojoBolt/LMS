import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Lock, ChevronDown } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '../../../context/ThemeContext'; 


const Workshops = () => {
    // --- State for dynamic data ---
    const [allWorkshops, setAllWorkshops] = useState([]);
    const [filteredWorkshops, setFilteredWorkshops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [userEnrolledCourseIds, setUserEnrolledCourseIds] = useState(new Set());
    
    // --- State for filtering ---
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All categories');
    const navigate = useNavigate();

    const { theme } = useTheme(); 
    
    // --- Effect to get the current user's authentication state ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // --- Effect to fetch all necessary data ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch all published workshops from Firestore
                const workshopsQuery = query(
                    collection(db, 'courses'), 
                    where("contentType", "==", "workshop"), 
                    where("isPublished", "==", true)
                );
                const workshopsSnapshot = await getDocs(workshopsQuery);
                const workshopData = workshopsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setAllWorkshops(workshopData);
                setFilteredWorkshops(workshopData);

                // Create a unique list of categories for the dropdown
                const uniqueCategories = [...new Set(workshopData.map(ws => ws.courseCategory).filter(Boolean))];
                setCategories(uniqueCategories);

                // 2. If a user is logged in, fetch their enrolled courses
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        setUserEnrolledCourseIds(new Set(userDocSnap.data().enrolledCourses || []));
                    }
                } else {
                    setUserEnrolledCourseIds(new Set());
                }

            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to fetch workshops: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // --- Effect to apply category filter ---
    useEffect(() => {
        if (selectedCategory === 'All categories') {
            setFilteredWorkshops(allWorkshops);
        } else {
            const filtered = allWorkshops.filter(workshop => workshop.courseCategory === selectedCategory);
            setFilteredWorkshops(filtered);
        }
    }, [selectedCategory, allWorkshops]);

    const getTagColor = (tag) => {
        switch (tag) {
            case 'Coding': return 'bg-purple-600';
            case 'AI Agents': return 'bg-orange-500';
            default: return 'bg-gray-600';
        }
    };

    const getTagIcon = (tag) => {
        if (tag === 'AI Agents') {
            return (
                <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
            );
        }
        return null;
    };

    const containerBg = theme === 'dark' ? 'bg-[#171717]' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-black';
    const cardColor = theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-100';
    const spinnerColor = theme === 'dark' ? 'border-white' : 'border-black';
    const borderColor = theme === 'dark' ? 'border-black/50' : 'border-gray-200';
    const Hover = theme === 'dark' ? 'hover:text-white' : 'hover:text-gray-800'

    if (loading) {
        return <div className={`flex justify-center items-center h-screen ${containerBg}`}>
                <div className={`w-12 h-12 border-4 ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
            </div>;
    }

    if (error) {
        return <div className="p-8 max-w-7xl ml-[300px] text-red-600">{error}</div>;
    }

    return (
    <div className={`p-3 sm:p-4 md:p-6 ${containerBg} h-screen lg:ml-[300px] mt-[60px] lg:mt-0 mb-[60px] lg:mb-0 overflow-hidden overflow-x-hidden`}>
    <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textColor} mb-2`}>
            On-demand workshops
        </h1>
        <p className={`${textColor} text-base sm:text-lg`}>
            Access our library of recorded workshops that you can watch anytime, at your own pace.
        </p>
    </div>

    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        <div className="relative flex-1 sm:flex-none">
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-8 sm:pr-10 text-sm sm:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:min-w-48"
            >
                <option>All categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
        </div>
        
        <button 
            onClick={() => setSelectedCategory('All categories')} 
            className={`w-full sm:w-auto ${textColor} ${Hover} font-medium text-sm sm:text-base py-2 sm:py-4 sm:px-3 rounded-2xl ${cardColor} shadow`}
        >
            Clear filters
        </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        {filteredWorkshops.map((workshop) => {
            const isEnrolled = userEnrolledCourseIds.has(workshop.id);
            const isAccessible = workshop.isFree || isEnrolled;

            return (
                <Link 
                    to={isAccessible ? `/student/workshops/${workshop.id}` : `/student/checkout/${workshop.id}`}
                    key={workshop.id} 
                    className={`${cardColor} rounded-lg overflow-hidden border ${borderColor} hover:shadow-md transition-shadow`}
                >
                    <div className="relative bg-black h-40 sm:h-44 md:h-48">
                        <img 
                            src={workshop.courseThumbnail || 'https://placehold.co/300x200/111827/FFFFFF?text=Workshop'} 
                            alt={workshop.courseTitle} 
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-1 sm:gap-2 flex-wrap">
                            {workshop.tags && workshop.tags.map((tag, index) => (
                                <div key={index} className={`${getTagColor(tag)} text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1`}>
                                    {getTagIcon(tag)}
                                    <span className="hidden xs:inline">{tag}</span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-1 sm:gap-2">
                            <button className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50">
                                <Bookmark className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                            </button>
                            {/* The lock icon now renders if the workshop is NOT accessible */}
                            {!isAccessible && (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                                    <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-blue-500 rounded-full overflow-hidden border-2 border-white">
                            {/* Placeholder for instructor image */}
                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                        </div>
                    </div>
                    
                    <div className="p-4 sm:p-5 md:p-6">
                        <h3 className={`text-lg sm:text-xl font-semibold ${textColor} mb-2 sm:mb-3 leading-tight h-12 sm:h-14 md:h-16 overflow-hidden`}>
                            {workshop.courseTitle}
                        </h3>
                        <div className={`space-y-1 sm:space-y-2 text-xs sm:text-sm ${textColor}`}>
                            <div>{workshop.courseCategory}</div>
                            <div>Hosted by {workshop.instructorName || 'AI-School'}</div>
                        </div>
                    </div>
                </Link>
            );
        })}
    </div>
</div>
    );
};

export default Workshops;
