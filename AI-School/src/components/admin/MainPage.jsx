import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Users, Database, DollarSign, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { auth, db } from '../../lib/firebaseConfig';
import { doc, getDoc, collection, query, where, onSnapshot, deleteDoc, orderBy, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
  const [adminUser, setAdminUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0);
  const [activeCoursesCount, setActiveCoursesCount] = useState(0);
  const [completedCoursesCount, setCompletedCoursesCount] = useState(0);
  const [totalStudentsCount, setTotalStudentsCount] = useState(0);
  const [totalCoursesCount, setTotalCoursesCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [recentCourses, setRecentCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(4); 
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setAdminUser(userDocSnap.data());
          } else {
            console.log("No user document found for UID:", user.uid);
            setAdminUser({ name: user.displayName || user.email, role: 'student' });
          }
        } catch (error) {
          console.error("Error fetching admin user document:", error);
          setAdminUser(null);
        }
      } else {
        setAdminUser(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribeAuth();
  }, []);

  
  useEffect(() => {
    if (loadingUser) return; 

    if (!adminUser || adminUser.role !== 'admin') {
      navigate(adminUser ? '/student/dashboard' : '/login');
    }
  }, [adminUser, loadingUser, navigate]);

// admin role 

  useEffect(() => {
    if (loadingUser || !adminUser || adminUser.role !== 'admin') {
      return;
    }

    
    (async () => {
      const coursesCollectionRef = collection(db, 'courses');
      const coursesQuery = query(coursesCollectionRef, orderBy("createdAt", "desc"));

      const unsubscribeCourses = onSnapshot(coursesQuery, async (snapshot) => {
        const coursesList = snapshot.docs.map(doc => ({
          id: doc.id,
          title: doc.data().courseTitle,
          ...doc.data()
        }));
       
        const sortedCourses = coursesList.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        setAllCourses(sortedCourses);
        setTotalCoursesCount(sortedCourses.length);

        
        const coursesWithEnrollmentsPromises = coursesList.map(async (course) => {
      
          const enrollmentsQuery = query(
            collection(db, "enrollments"),
            where("courseId", "==", course.id)
          );

          const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

          const enrolledStudentsCount = enrollmentsSnapshot.size;

          return {
            ...course,
            title: course.courseTitle, 
            enrolledStudents: enrolledStudentsCount,
          };
        });

        const coursesWithEnrollments = await Promise.all(coursesWithEnrollmentsPromises);

        setTotalCoursesCount(coursesWithEnrollments.length);
        setRecentCourses(coursesWithEnrollments.slice(0, 5)); 
      }, (error) => {
        console.error("Error fetching courses with enrollments: ", error);
      });

      const enrollmentsCollectionRef = collection(db, 'enrollments');
      const qEnrollments = query(enrollmentsCollectionRef);
      const unsubscribeEnrollments = onSnapshot(qEnrollments, (snapshot) => {
        let enrolled = 0, active = 0, completed = 0;
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.status === 'enrolled') enrolled++;
          else if (data.status === 'active') active++;
          else if (data.status === 'completed') completed++;
        });
        setEnrolledCoursesCount(enrolled);
        setActiveCoursesCount(active);
        setCompletedCoursesCount(completed);
      }, (error) => {
        console.error("Error fetching enrollments: ", error);
      });

      const usersCollectionRef = collection(db, 'users');
      const qStudents = query(usersCollectionRef, where('role', '==', 'student'));
      const unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
        setTotalStudentsCount(snapshot.docs.length);
      }, (error) => {
        console.error("Error fetching students: ", error);
      });

      const earningsDocRef = doc(db, 'dashboard_summary', 'overall_earnings');
      const unsubscribeEarnings = onSnapshot(earningsDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setTotalEarnings(docSnap.data().total || 0);
        } else {
          setTotalEarnings(0);
        }
      }, (error) => {
        console.error("Error fetching earnings: ", error);
      });

    
      return () => {
        unsubscribeCourses();
        unsubscribeEnrollments();
        unsubscribeStudents();
        unsubscribeEarnings();
      };
    })();
  }, [adminUser, loadingUser]);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete the course "${courseTitle}"? This action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, 'courses', courseId));
        console.log(`Course ${courseId} deleted successfully.`);
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  useEffect(() => {
    if (allCourses.length > 0) {
        const indexOfLastCourse = currentPage * coursesPerPage;
        const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
        setRecentCourses(allCourses.slice(indexOfFirstCourse, indexOfLastCourse));
    }
  }, [currentPage, allCourses, coursesPerPage]);
  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => prev - 1);
  };

  const handleEditCourse = (courseId) => {
    navigate(`/admin/edit-course/${courseId}`);
  };

  const handlePageClick = (pageNumber) => {
  setCurrentPage(pageNumber);
};
  
  if (loadingUser || !adminUser || adminUser.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Loading...</p>
      </div>
    );
  }
  
  const totalPages = Math.ceil(totalCoursesCount / coursesPerPage); 

  return (
    <div className="min-h-screen overflow-x-hidden">
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 h-[200px] sm:h-[200px] rounded-2xl relative overflow-hidden max-w-[100%] mt-[65px] lg:mt-0 mx-auto shadow-lg">
  <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-y-24 translate-x-24"></div>
  <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-12 translate-x-12"></div>
  <div className="p-4 sm:p-6 lg:p-12 relative z-10 h-full">
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between h-full">
      {/* Profile Section */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 lg:mb-0">
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-12 translate-x-12"></div>
        <div className="relative">
          <img
            src={adminUser?.profilePicUrl || "https://img.freepik.com/free-photo/african-teenage-girl-portrait-happy-smiling-face_53876-146757.jpg?uid=R160851296&ga=GA1.1.1292176217.1739379214&semt=ais_hybrid&w=740"}
            alt={adminUser?.name || "Admin User"}
            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-22 lg:h-22 rounded-full border-4 border-white shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="text-white">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2">
            {loadingUser ? "Loading..." : (adminUser?.name || "Guest User")}
          </h1>
          <p className="text-purple-200 text-sm sm:text-base lg:text-lg">
            {loadingUser ? "Loading..." : (adminUser?.role || "Visitor")}
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mt-auto lg:mt-0 w-[70%] sm:w-auto">
        <button className="bg-white text-purple-700 px-4 sm:px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base">
          Add New Course
        </button>
        <button className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-full font-medium hover:bg-red-600 transition-colors text-sm sm:text-base">
          Student Dashboard
        </button>
      </div>
    </div>
  </div>
</div>

      {/* Stats Grid */}
      <div className="px-2 py-8 lg:px-12 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-[100%]">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900">{enrolledCoursesCount}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900">{activeCoursesCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed Courses</p>
                <p className="text-3xl font-bold text-gray-900">{completedCoursesCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{totalStudentsCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{totalCoursesCount}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mx-auto p-2 lg:p-8 max-w-7xl mb-[60px] lg:mb-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Recently Created Courses</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
            <div className="font-semibold text-gray-700 col-span-2">Courses</div>
            <div className="font-semibold text-gray-700 text-center">Enrolled</div>
            <div className="font-semibold text-gray-700 text-center">Actions</div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentCourses.length > 0 ? (
              recentCourses.map((course) => (
                <div key={course.id} className="grid grid-cols-4 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 col-span-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-white text-xs font-bold">
                        {course.title?.split(' ').map(word => word[0])?.slice(0, 2)?.join('') || ''}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {course.title || 'Untitled Course'}
                      </h3>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-sm text-gray-600">{course.enrolledStudents || 0}</span>
                  </div>
                  <div className="text-center flex justify-center items-center space-x-2">
                    <button onClick={() => handleEditCourse(course.id)} className="text-blue-600 hover:text-blue-800 transition-colors" title="Edit Course">
                      <Pencil size={20} />
                    </button>
                    <button onClick={() => handleDeleteCourse(course.id, course.title)} className="text-red-600 hover:text-red-800 transition-colors" title="Delete Course">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No recent courses found.</div>
            )}
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-t-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageClick(idx + 1)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === idx + 1
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                >
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

export default MainPage;