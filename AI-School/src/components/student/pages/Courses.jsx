import React, { useState, useEffect, useMemo } from 'react';
import { Link } from "react-router-dom";
import { Bookmark, LockKeyhole, GraduationCap } from "lucide-react";
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import badgeImage from '../../../assets/images/badge.png'; 
import { useTheme } from '../../../context/ThemeContext';


const categoryStyles = {
    'General': { badge: 'bg-purple-200', cert: 'border-indigo-400 text-indigo-400' },
    'design': { badge: 'bg-blue-200', cert: 'border-blue-400 text-blue-400' },
    'web-development': { badge: 'bg-orange-200', cert: 'border-orange-400 text-orange-400' },
    'Content': { badge: 'bg-orange-200', cert: 'border-orange-400 text-orange-400' },
    'Education': { badge: 'bg-green-200', cert: 'border-green-400 text-green-400' },
    'Business Operations': { badge: 'bg-purple-200', cert: 'border-purple-400 text-purple-400' },
    'default': { badge: 'bg-gray-200', cert: 'border-gray-400 text-gray-400' }
};

const Courses = () => {
    // --- State for dynamic data ---
    const [allCourses, setAllCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [userEnrolledCourseIds, setUserEnrolledCourseIds] = useState(new Set());
    
    // --- State for filtering ---
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All categories');

    const { theme } = useTheme();

    // --- Effect to get the current user's authentication state ---
    const containerBg = theme === 'dark' ? 'bg-[#171717]' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-black';
    const cardColor = theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-100';
    const spinnerColor = theme === 'dark' ? 'border-white' : 'border-black';
    const borderColor = theme === 'dark' ? 'border-black/50' : 'border-gray-200';

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch all published content from Firestore
                const contentQuery = query(collection(db, 'courses'), where("isPublished", "==", true));
                const contentSnapshot = await getDocs(contentQuery);
                const allContent = contentSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // 2. Filter out the guides on the client-side to only keep courses
                const courseData = allContent.filter(item => item.contentType !== 'guide' && item.contentType !== 'workshop');


                setAllCourses(courseData);
                setFilteredCourses(courseData);

                const uniqueCategories = [...new Set(courseData.map(course => course.courseCategory).filter(Boolean))];
                setCategories(uniqueCategories);

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
                setError('Failed to fetch courses: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // --- Effect to apply category filter ---
    useEffect(() => {
        if (selectedCategory === 'All categories') {
            setFilteredCourses(allCourses);
        } else {
            const filtered = allCourses.filter(course => course.courseCategory === selectedCategory);
            setFilteredCourses(filtered);
        }
    }, [selectedCategory, allCourses]);

    if (loading) {
        return <div className={`flex justify-center items-center h-screen ${containerBg}`}>
                <div className={`w-12 h-12 border-4 ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
            </div>;
    }

    if (error) {
        return <div className="p-8 max-w-7xl ml-[300px] text-red-600">{error}</div>;
    }
    

    return (
        <div className={`p-2 sm:p-4 lg:ml-[300px] mb-[65px] lg:mb-0 mt-[65px] lg:mt-0 ${containerBg}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
                <h2 className={`text-2xl sm:text-3xl font-bold ${textColor}`}>Courses</h2>
                <button onClick={() => setSelectedCategory('All categories')} className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-400 rounded-full hover:bg-gray-100 whitespace-nowrap ${textColor}`}>Clear filters</button>
            </div>

            <div className={`mb-4 sm:mb-6 ${containerBg}`}>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full sm:w-auto border rounded-lg px-3 sm:px-4 py-2 text-sm ${textColor}`}
                >
                    <option value="All categories">All categories</option>
                    {categories.map(cat => <option className={`${containerBg}`} key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCourses.map((course) => {
                    const isEnrolled = userEnrolledCourseIds.has(course.id);
                    const style = categoryStyles[course.courseCategory] || categoryStyles.default;
                    const certColor = isEnrolled ? "border-blue-500 text-white " : "border-green-700 text-white bg-green-700s";

                    return (
                        <Link
                            to={isEnrolled ? `/student/courses/${course.id}` : `/student/course/${course.id}`}
                            key={course.id}
                            className={`${cardColor} border ${borderColor} rounded-xl overflow-hidden hover:shadow-md transition duration-200 cursor-pointer`}
                        >
                            <div className="relative bg-black text-white p-4 sm:p-6 lg:p-9">
                                <div className='w-full'>
                                    <h3 className={`text-base sm:text-lg font-semibold mb-2 break-words pr-12 sm:pr-16 ${textColor}`}>{course.courseTitle}</h3>
                                </div>
                                <div className="w-full sm:w-[70%] lg:w-[60%]">
                                    <p className="text-xs sm:text-sm mb-3 sm:mb-4 h-8 sm:h-10 truncate">{course.shortDescription}</p>
                                </div>
                                <button
                                    className={`text-xs sm:text-sm border px-3 sm:px-4 py-1 rounded ${certColor}`}
                                >
                                    {isEnrolled ? 'Continue Learning' : 'Get Certification'}
                                </button>
                                <div className={`absolute top-0 right-0 h-full w-20 sm:w-25 ${style.badge} flex items-center justify-center text-[8px] sm:text-[10px] font-semibold text-center p-1 mr-2 sm:mr-4 [clip-path:polygon(0_0,100%_0,100%_90%,50%_100%,0_90%)]`}>
                                    <div className='text-xs sm:text-[15px] text-black'>
                                        {course.courseCategory}
                                        <div className="mt-8 sm:mt-12 lg:mt-[60px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <img src={badgeImage} alt="badge" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <Bookmark size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                {!isEnrolled && (
                                    <div className="absolute top-2 right-8 sm:right-10 w-6 h-6 sm:w-8 sm:h-8 p-1 sm:p-2 bg-gray-600 rounded-full flex items-center justify-center">
                                        <LockKeyhole size={14} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                )}
                            </div>

                            <div className="p-3 sm:p-4">
                                <h4 className={`font-semibold text-sm mb-1 ${textColor}`}>{course.courseTitle}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                                    <span className="bg-gray-200 px-2 py-0.5 rounded-full flex gap-1">
                                        <GraduationCap size={12} className="sm:w-[14px] sm:h-[14px]" />Certificate
                                    </span>
                                </div>
                                <p className={`text-xs text-gray-500 ${textColor}`}>{course.courseCategory}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Courses;
