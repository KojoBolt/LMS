import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Database, DollarSign, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth, db } from '../../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const InstructorDashboard = () => {
    const [instructorUser, setInstructorUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    
    // State for stats
    const [totalCoursesCount, setTotalCoursesCount] = useState(0);
    const [totalStudentsCount, setTotalStudentsCount] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);

    // State for the paginated course list
    const [allCourses, setAllCourses] = useState([]); 
    const [recentCourses, setRecentCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [coursesPerPage] = useState(5); 

    const navigate = useNavigate();

    // Effect to get the current logged-in user
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setInstructorUser(userDocSnap.data());
                }
            } else {
                setInstructorUser(null);
            }
            setLoadingUser(false);
        });
        return () => unsubscribeAuth();
    }, []);

    // Effect to fetch all data related to THIS instructor
    useEffect(() => {
        if (!instructorUser) return;

        // Create a query to get only the courses created by the current instructor
        const coursesQuery = query(
            collection(db, 'courses'), 
            where("createdBy", "==", instructorUser.uid)
        );

        const unsubscribeCourses = onSnapshot(coursesQuery, (snapshot) => {
            const coursesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort by creation date and set for the paginated list
            const sortedCourses = coursesList.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setAllCourses(sortedCourses);
            setTotalCoursesCount(sortedCourses.length);

            // --- Calculate Total Students and Earnings for THIS instructor ---
            if (coursesList.length > 0) {
                const courseIds = coursesList.map(c => c.id);
                const enrollmentsQuery = query(
                    collection(db, "enrollments"),
                    where("courseId", "in", courseIds)
                );

                onSnapshot(enrollmentsQuery, (enrollmentsSnapshot) => {
                    const enrollments = enrollmentsSnapshot.docs.map(d => d.data());
                    
                    // Calculate unique students
                    const uniqueStudentIds = new Set(enrollments.map(e => e.userId));
                    setTotalStudentsCount(uniqueStudentIds.size);
                    
                    // Calculate total earnings
                    const total = enrollments.reduce((sum, e) => sum + (e.amountPaid || 0), 0);
                    setTotalEarnings(total);
                });
            } else {
                setTotalStudentsCount(0);
                setTotalEarnings(0);
            }
        });

        return () => unsubscribeCourses();
    }, [instructorUser]);

    // Effect to handle pagination logic
    useEffect(() => {
        if (allCourses.length > 0) {
            const indexOfLastCourse = currentPage * coursesPerPage;
            const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
            setRecentCourses(allCourses.slice(indexOfFirstCourse, indexOfLastCourse));
        } else {
            setRecentCourses([]);
        }
    }, [currentPage, allCourses, coursesPerPage]);

    const handleDeleteCourse = async (courseId, courseTitle) => {
        if (window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
            await deleteDoc(doc(db, 'courses', courseId));
        }
    };

    const handleEditCourse = (courseId) => {
        navigate(`/instructor/edit-course/${courseId}`); // Navigate to an instructor edit page
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(totalCoursesCount / coursesPerPage);
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };
    
    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    if (loadingUser) {
        return <div className="flex justify-center items-center h-screen"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    const totalPages = Math.ceil(totalCoursesCount / coursesPerPage); 

    return (
        <div className="min-h-screen overflow-x-hidden lg:ml-[300px] bg-gray-100 mt-[65px] lg:mt-0">
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 h-[150px] sm:h-[200px] rounded-2xl relative overflow-hidden max-w-[90%] mt-[65px] lg:mt-[65px] mx-auto shadow-lg">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-24 translate-x-24"></div>
                <div className="p-4 sm:p-6 lg:p-12 relative z-10 h-full">
                    <div className="flex items-center space-x-4">
                        <img
                            src={instructorUser?.profilePicUrl || "https://placehold.co/88x88/FFFFFF/333333?text=I"}
                            alt={instructorUser?.name || "Instructor"}
                            className="w-20 h-20 lg:w-22 lg:h-22 rounded-full border-4 border-white shadow-lg"
                        />
                        <div className="text-white">
                            <h1 className="text-xl lg:text-2xl font-bold">
                                {instructorUser?.name || "Instructor"}
                            </h1>
                            <p className="text-indigo-200 text-sm lg:text-lg capitalize">
                                {instructorUser?.role || "Instructor"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-2 py-8 lg:px-12 lg:py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* <div className="bg-white rounded-2xl p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-gray-600 text-sm font-medium mb-1">Total Students</p><p className="text-3xl font-bold text-gray-900">{totalStudentsCount}</p></div><div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><Users className="w-6 h-6 text-purple-600" /></div></div></div> */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm "><div className="flex items-center justify-between"><div><p className="text-gray-600 text-sm font-medium mb-1">Total Courses</p><p className="text-3xl font-bold text-gray-900">{totalCoursesCount}</p></div><div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center"><Database className="w-6 h-6 text-cyan-600" /></div></div></div>
                    {/* <div className="bg-white rounded-2xl p-6 shadow-sm border"><div className="flex items-center justify-between"><div><p className="text-gray-600 text-sm font-medium mb-1">Total Earnings</p><p className="text-3xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p></div><div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center"><DollarSign className="w-6 h-6 text-indigo-600" /></div></div></div> */}
                </div>
            </div>

            {/* Courses Section */}
            <div className="mx-auto p-2 lg:p-8 max-w-7xl mb-[60px] lg:mb-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Content</h1>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b rounded-t-lg">
                        <div className="font-semibold text-gray-700 col-span-2">Title</div>
                        <div className="font-semibold text-gray-700 text-center">Type</div>
                        <div className="font-semibold text-gray-700 text-center">Actions</div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentCourses.length > 0 ? (
                            recentCourses.map((course) => (
                                <div key={course.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-gray-50">
                                    <div className="flex items-center space-x-3 col-span-2">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><div className="text-white text-xs font-bold">{course.courseTitle?.split(' ').map(word => word[0])?.slice(0, 2)?.join('') || ''}</div></div>
                                        <div className="min-w-0"><h3 className="text-sm font-medium text-gray-900 line-clamp-2">{course.courseTitle || 'Untitled'}</h3></div>
                                    </div>
                                    <div className="text-center"><span className="text-sm text-gray-600 capitalize">{course.contentType}</span></div>
                                    <div className="text-center flex justify-center items-center space-x-2">
                                        <button onClick={() => handleEditCourse(course.id)} className="text-blue-600 hover:text-blue-800" title="Edit"><Pencil size={20} /></button>
                                        <button onClick={() => handleDeleteCourse(course.id, course.courseTitle)} className="text-red-600 hover:text-red-800" title="Delete"><Trash2 size={20} /></button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">You haven't created any content yet.</div>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <div className="bg-gray-50 px-6 py-4 border-t">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                                <div className="flex items-center space-x-1">
                                    <button onClick={handlePrevPage} disabled={currentPage === 1} className="p-2 text-gray-600 rounded-lg disabled:text-gray-300"><ChevronLeft size={16} /></button>
                                    {Array.from({ length: totalPages }, (_, idx) => (
                                        <button key={idx + 1} onClick={() => handlePageClick(idx + 1)} className={`px-3 py-1 rounded-lg text-sm font-medium ${currentPage === idx + 1 ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>{idx + 1}</button>
                                    ))}
                                    <button onClick={handleNextPage} disabled={currentPage === totalPages} className="p-2 text-gray-600 rounded-lg disabled:text-gray-300"><ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
