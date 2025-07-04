import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../../lib/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

// A helper function to format Firestore Timestamps into a readable string
const formatEnrollmentDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) {
        return "No date";
    }
    const date = timestamp.toDate();
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
};

const StudentEnrollments = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- THIS IS THE CORRECTED FIREBASE LOGIC ---
    useEffect(() => {
        // This query now listens to the 'enrollments' collection, which is the source of truth.
        const q = query(
            collection(db, "enrollments"), 
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            setLoading(true);
            const enrollmentsData = [];
            
            // Use Promise.all to handle all asynchronous user data fetches
            const promises = querySnapshot.docs.map(async (enrollmentDoc) => {
                const enrollment = enrollmentDoc.data();
                
                // For each enrollment, fetch the corresponding user's details
                const userDocRef = doc(db, "users", enrollment.userId);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    enrollmentsData.push({
                        id: userDocSnap.id, // Use the user's ID
                        name: userData.name || 'N/A',
                        enrollDate: formatEnrollmentDate(enrollment.createdAt),
                        progress: enrollment.progress || 0,
                        courses: userData.enrolledCourses ? userData.enrolledCourses.length : 1,
                        avatar: userData.profilePicUrl || `https://ui-avatars.com/api/?name=${userData.name || 'A'}&background=random`
                    });
                }
            });

            await Promise.all(promises);
            
            setStudents(enrollmentsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching student enrollments: ", err);
            setError("Failed to load student data. Please try again later.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getProgressColor = (progress) => {
        if (progress === 0) return 'bg-gray-300';
        if (progress <= 20) return 'bg-red-500';
        if (progress <= 60) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getProgressWidth = (progress) => {
        return `${progress}%`;
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 ml-[300px] flex justify-center items-center">
                <div className="text-lg font-medium text-gray-600">Loading Student Data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 ml-[300px] flex justify-center items-center">
                <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 ml-[300px]">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gray-100 px-6 py-4 border-b border-b-gray-300">
                        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                            <div className="col-span-2">Student ID</div>
                            <div className="col-span-3">Student Name</div>
                            <div className="col-span-2">Enroll Date</div>
                            <div className="col-span-2">Progress</div>
                            <div className="col-span-1">Courses</div>
                            <div className="col-span-2"></div>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <div key={student.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-2">
                                            <span className="text-blue-600 font-medium">#{student.id.substring(0, 8)}</span>
                                        </div>

                                        <div className="col-span-3 flex items-center space-x-3">
                                            <img src={student.avatar} alt={student.name} className="w-8 h-8 rounded-full object-cover"/>
                                            <span className="text-gray-900 font-medium">{student.name}</span>
                                        </div>

                                        <div className="col-span-2">
                                            <span className="text-gray-600">{student.enrollDate}</span>
                                        </div>

                                        <div className="col-span-2">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-1">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                                                            style={{ width: getProgressWidth(student.progress) }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-600 min-w-[3rem]">{student.progress}%</span>
                                            </div>
                                        </div>

                                        <div className="col-span-1">
                                            <span className="text-gray-900 font-medium">{student.courses.toString().padStart(2, '0')}</span>
                                        </div>

                                        <div className="col-span-2 flex items-center justify-end space-x-2">
                                            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><MessageCircle size={16} /></button>
                                            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"><Phone size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-8 text-gray-500">
                                No students have enrolled yet.
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4 border-t border-t-gray-300">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Page 1 of 1</span>
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors" disabled>
                                    <ChevronLeft size={16} />
                                </button>
                                <button className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium">
                                    1
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-800 hover:bg-white rounded-lg transition-colors" disabled>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentEnrollments;
