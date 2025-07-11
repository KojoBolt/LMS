import React, { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {useOutletContext} from 'react-router-dom'; 

import CourseList from "./CourseList"; 
import Categories from "./Categories";
import MainContent from "./MainContent";

const Dashboard = () => {
 const { searchTerm } = useOutletContext(); 

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userEnrolledCourseIds, setUserEnrolledCourseIds] = useState([]);

    // --- This useEffect handles user authentication ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // --- This useEffect fetches all necessary data once the user is known ---
    useEffect(() => {
        if (!user) {
            setLoading(false); // If there's no user, stop loading
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Get the user's document to find their enrolled course IDs
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                const enrolledIds = userDocSnap.exists() ? userDocSnap.data().enrolledCourses || [] : [];
                setUserEnrolledCourseIds(enrolledIds);

                // 2. Fetch all courses at once
                const coursesQuery = query(collection(db, 'courses'));
                const coursesSnapshot = await getDocs(coursesQuery);
                const allCoursesData = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAllCourses(allCoursesData);

                // 3. Filter the full list to get the details of enrolled courses
                if (enrolledIds.length > 0) {
                    const enrolledCoursesData = allCoursesData.filter(course => enrolledIds.includes(course.id));
                    setEnrolledCourses(enrolledCoursesData);
                }

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load your dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [user]); // This effect re-runs if the user logs in or out
   
   const filteredEnrolledCourses = useMemo(() => {
        if (!searchTerm) return enrolledCourses;
        return enrolledCourses.filter(course => 
            course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, enrolledCourses]);

    const filteredAllCourses = useMemo(() => {
        if (!searchTerm) return allCourses;
        return allCourses.filter(course => 
            course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allCourses]);


    // --- This is the single loading state for the entire page ---
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen lg:ml-[300px]">
                <div className="w-12 h-12 border-4 border-black-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }
    
    if (error) {
        return <div className="p-8 ml-[300px] text-red-500">{error}</div>;
    }

    return (
        <div className="p-6 w-[ calc(100vw - 300px)] max-w-[calc(100vw - 300px)] lg:ml-[300px] overflow-auto overflow-x-hidden bg-white mt-4 lg:mt-0">
            {/* Pass the fetched data down to the child components as props */}
            <MainContent enrolledCourses={filteredEnrolledCourses} />
            <div className="mt-10">
                <CourseList 
                    allCourses={filteredAllCourses}
                    userEnrolledCourseIds={userEnrolledCourseIds} 
                />
            </div>
            <div className="mt-6 mb-9 lg:mb-0">
                <Categories />
            </div>
        </div>
    );
};

export default Dashboard;
