import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, LockKeyhole, GraduationCap } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../lib/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import badgeImage from '../../../assets/images/badge.png'; 

const Courses = () => {
  // --- State for dynamic data ---
  const [allCourses, setAllCourses] = useState([]); // Stores the master list of all courses
  const [filteredCourses, setFilteredCourses] = useState([]); // Stores the courses to be displayed after filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userEnrolledCourseIds, setUserEnrolledCourseIds] = useState([]);
  
  // --- NEW: State for filtering ---
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const navigate = useNavigate();

  // --- Effect to get the current user's authentication state ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // --- Effect to fetch all necessary data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch all published courses
        const coursesQuery = query(collection(db, 'courses'), where("isPublished", "==", true));
        const coursesSnapshot = await getDocs(coursesQuery);
        const courseData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllCourses(courseData); // Store the full list
        setFilteredCourses(courseData); // Initially, show all courses

        // Create a unique list of categories for the dropdown
        const uniqueCategories = [...new Set(courseData.map(course => course.courseCategory))];
        setCategories(uniqueCategories);

        // 2. If a user is logged in, fetch their enrolled courses
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserEnrolledCourseIds(userDocSnap.data().enrolledCourses || []);
          }
        } else {
            setUserEnrolledCourseIds([]);
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

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredCourses(allCourses);
    } else {
      const filtered = allCourses.filter(course => course.courseCategory === selectedCategory);
      setFilteredCourses(filtered);
    }
  }, [selectedCategory, allCourses]);


  if (loading) {
    return <div className="flex items-center justify-center h-screen">
  <div className="w-12 h-12 border-4 border-black-600 border-t-transparent rounded-full animate-spin"></div>
</div>;
  }

  if (error) {
    return <div className="p-8 max-w-7xl ml-[300px] text-red-600">{error}</div>;
  }

  return (
    <div className="p-8 ml-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Courses</h2>
        <button onClick={() => setSelectedCategory('All')} className="text-sm px-4 py-2 border border-gray-400 rounded-full hover:bg-gray-100">Clear filters</button>
      </div>

      <div className="mb-6">
        {/* --- UPDATED: The dropdown is now dynamic and controlled --- */}
        <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm"
        >
          <option value="All">All categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = userEnrolledCourseIds.includes(course.id);
          const badgeColor = "bg-blue-200"; 
          // const certColor = "border-indigo-400 text-indigo-400";

          const certColor = isEnrolled 
            ? "border-3 border-blue-500 text-white" 
            : "border-3 border-green-700 text-white";

          return (
            <Link
              to={isEnrolled ? `/student/courses/${course.id}` : `/student/checkout/${course.id}`}
              key={course.id}
              className="bg-gray-100 border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition duration-200 cursor-pointer"
            >
              <div className="relative bg-black text-white p-9">
                <div className='w-[60%]'>
                  <h3 className="text-lg font-semibold mb-2">{course.courseTitle}</h3>
                </div>
                <div className="w-[60%]">
                <p className="text-sm mb-4 h-10 truncate">{course.shortDescription}</p>

                </div>
                <button
                  className={`text-sm border px-4 py-1 rounded ${certColor}`}
                >
                  {isEnrolled ? 'Continue Learning' : 'Get Certification'}
                </button>
                  <div className={`absolute top-0 right-0 h-full w-28 ${badgeColor} flex items-center justify-center text-[10px] font-semibold text-center p-1 mr-4 [clip-path:polygon(0_0,100%_0,100%_90%,50%_100%,0_90%)]`}>
                    <div className='text-[15px] text-black'>
                      {course.courseCategory}
                      <div className="mt-[60px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                            <img src={badgeImage} alt="badge" className="w-12 h-12 " />
                                          </div>
                    </div>
                    
                  </div>  
                    <div className="absolute top-2 right-2">
                  <Bookmark size={18} />
                </div>
                {!isEnrolled && (
                  <div className="absolute top-2 right-10 w-8 h-8 p-2 bg-gray-600 rounded-full flex items-center justify-center">
                    <LockKeyhole size={18} />
                  </div>
                )}
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-sm mb-1">{course.courseTitle}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span className="bg-gray-200 px-2 py-0.5 rounded-full flex gap-1">
                    <GraduationCap size={14} />Certificate
                  </span>
                </div>
                <p className="text-xs text-gray-500">{course.courseCategory}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Courses;
