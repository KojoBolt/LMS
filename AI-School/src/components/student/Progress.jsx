import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { auth, db } from '../../lib/firebaseConfig'; 
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import badgeImage from "../../assets/images/badge.png"; 
import { useTheme } from '../../context/ThemeContext';

const categoryColors = {
    'web-development': 'bg-green-200',
    'Data Science': 'bg-purple-200',
    'Marketing': 'bg-orange-200',
    'Design': 'bg-pink-200',
    'Finance': 'bg-emerald-200',
    'General': 'bg-gray-200',
    'default': 'bg-gray-200'
};

const Progress = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const { theme } = useTheme();

    const containerBg = theme === 'dark' ? 'bg-[#171717]' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-700';
    const cardBg = theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-50' 

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setEnrolledCourses([]); 
            return;
        }

        const fetchEnrolledCourses = async () => {
            setLoading(true);
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const enrolledCourseIds = userData.enrolledCourses || [];

                    if (enrolledCourseIds.length > 0) {
                        const coursesQuery = query(
                            collection(db, 'courses'),
                            where('__name__', 'in', enrolledCourseIds)
                        );
                        
                        const coursesSnapshot = await getDocs(coursesQuery);
                        const coursesData = coursesSnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        setEnrolledCourses(coursesData);
                    } else {
                        setEnrolledCourses([]);
                    }
                }
            } catch (err) {
                console.error("Error fetching enrolled courses:", err);
                setError("Failed to load your courses.");
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) {
        return <div className="ml-[350px] mt-[30px] p-4 text-red-600">{error}</div>;
    }

    return (
        <div className={`p-3 sm:p-4 md:p-6 ${containerBg} lg:ml-[300px] mt-[60px] lg:mt-0 mb-[60px] lg:mb-0 overflow-auto overflow-x-hidden`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`flex flex-col items-start ${textColor}`}>
                    <h2 className="font-semibold flex text-4xl p-3">My Learning</h2>
                    <p className="text-gray-600 text-sm p-3">
                        Track your courses progress
                    </p>
                </div>
            </div>

            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">
                    {enrolledCourses.map((item) => {
                        const badgeColor = categoryColors[item.courseCategory] || categoryColors.default;

                        
                        if (item.contentType === 'guide' || item.contentType === 'workshop') {
                            
                            return (
                                <Link
                                    to={`/student/${item.contentType}s/${item.id}`} 
                                    key={item.id}
                                    className={`${cardBg} rounded-xl block hover:scale-[1.01] transition-transform border border-gray-200 overflow-hidden ${textColor}`}
                                >
                                    <div className="relative h-48 bg-black">
                                        <img 
                                            src={item.courseThumbnail || 'https://placehold.co/400x200/333/fff?text=Media'} 
                                            alt={item.courseTitle}
                                            className="w-full h-full object-cover opacity-50"
                                        />
                                        <div className="absolute top-2 left-2 bg-white/80 text-black text-xs px-2 py-1 rounded-full font-semibold capitalize">
                                            {item.contentType}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-base mb-1 truncate">{item.courseTitle}</h3>
                                        <p className="text-xs text-gray-500">{item.courseCategory}</p>
                                    </div>
                                </Link>
                            );
                        } else {
                            // Render the original, detailed card for regular Courses
                            return (
                                <Link
                                    to={`/student/courses/${item.id}`}
                                    key={item.id}
                                    className={`${cardBg} rounded-xl block hover:scale-[1.01] transition-transform border border-gray-200`}
                                >
                                    <div className="bg-black text-white p-4 rounded-t-xl relative min-h-[200px]">
                                        <div className='w-[70%]'>
                                            <h3 className="text-lg font-semibold mb-2">{item.courseTitle}</h3>
                                        </div>
                                        <div className="w-[70%]">
                                            <p className="text-sm mb-6 h-10 overflow-hidden">
                                                {item.shortDescription}
                                            </p>
                                        </div>
                                        <button className="px-3 py-1 border rounded border-indigo-500 text-white text-sm">
                                            Continue Course
                                        </button>
                                        <div
                                            className={`absolute top-0 right-0 h-full w-28 ${badgeColor} flex items-center justify-center text-[10px] font-semibold text-center mr-4 max-w-[100px] [clip-path:polygon(0_0,100%_0,100%_90%,50%_100%,0_90%)]`}
                                        >
                                            <div className="text-[15px] text-black">{item.courseCategory}</div>
                                            <div className="mt-[60px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                <img src={badgeImage} alt="badge" className="w-12 h-12" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`${cardBg} p-4 rounded-b-xl ${textColor}`}>
                                        <div className="text-sm text-black mb-1 bg-[#E3E3E3] p-1 w-[100px] rounded-2xl text-center ">
                                            Course
                                        </div>
                                        <div className="text-sm font-medium">{item.courseTitle}</div>
                                        <div className="text-xs text-gray-500">{item.courseLevel}</div>
                                    </div>
                                </Link>
                            );
                        }
                    })}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg p-16 text-center">
                    <p className="text-gray-500 text-lg">You have not enrolled in any courses yet.</p>
                    <Link to="/student/courses" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                        Browse Courses
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Progress;
