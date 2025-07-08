import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { auth, db } from '../../lib/firebaseConfig'; // Adjust path if needed
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import badgeImage from "../../assets/images/badge.png"; 

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
                        setEnrolledCourses([]); // User is logged in but has no enrolled courses
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
        return <div className="ml-[350px] mt-[30px] p-4">Loading your courses...</div>;
    }

    if (error) {
        return <div className="ml-[350px] mt-[30px] p-4 text-red-600">{error}</div>;
    }

    return (
        <div className=" ml-[350px] mt-[30px] w-full max-w-7xl px-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col items-start">
                    <h2 className="font-semibold flex text-4xl p-3">My Learning</h2>
                    <p className="text-gray-600 text-sm p-3">
                        Track your courses progress
                    </p>
                </div>
            </div>

            {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2">
                    {enrolledCourses.map((course) => {
                     
                        const badgeColor = categoryColors[course.courseCategory] || categoryColors.default;

                        return (
                            <Link
                                to={`/student/courses/${course.id}`}
                                key={course.id}
                                className="bg-white rounded-xl block hover:scale-[1.01] transition-transform border border-gray-200"
                            >
                                <div className="bg-black text-white p-4 rounded-t-xl relative min-h-[200px]">
                                    <div className='w-[70%]'>
                                        <h3 className="text-lg font-semibold mb-2">{course.courseTitle}</h3>

                                    </div>
                                    <div className="w-[70%]">
                                        <p className="text-sm mb-6">
                                            {course.shortDescription.split(' ').length > 20 
                                                ? course.shortDescription.split(' ').slice(0, 15).join(' ') + '...'
                                                : course.shortDescription
                                            }
                                        </p>
                                    </div>
                                    <button className="px-3 py-1 border rounded border-indigo-500 text-white text-sm">
                                        Continue Course
                                    </button>
                                    <div
                                        // Use the dynamic badgeColor variable here
                                        className={`absolute top-0 right-0 h-full w-23 ${badgeColor} flex items-center justify-center text-[10px] font-semibold text-center mr-4 max-w-[100px] [clip-path:polygon(0_0,100%_0,100%_90%,50%_100%,0_90%)]`}
                                    >
                                        <div className="text-[15px] text-black">{course.courseCategory}</div>
                                        <div className="mt-[60px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <img src={badgeImage} alt="badge" className="w-12 h-12" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-b-xl">
                                    <div className="text-sm text-black mb-1 bg-[#E3E3E3] p-1 w-[100px] rounded-2xl text-center">
                                        Course
                                    </div>
                                    <div className="text-sm font-medium">{course.courseTitle}</div>
                                    <div className="text-xs text-gray-500">{course.courseLevel}</div>
                                </div>
                            </Link>
                        );
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
