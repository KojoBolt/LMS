import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig'; // Adjust path to your firebaseConfig file

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 4;

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const courseData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(courseData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch courses: ' + err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const scroll = (direction) => {
    if (direction === 'left' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'right' && (currentPage + 1) * coursesPerPage < courses.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getCurrentCourses = () => {
    const startIndex = currentPage * coursesPerPage;
    return courses.slice(startIndex, startIndex + coursesPerPage);
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="relative">
      <h2 className="text-2xl font-semibold mb-2">Guide recommendations</h2>
      <p className="text-gray-500 mb-4">
        Based on your survey responses and platform history, we've curated the top AI guides for marketers.
      </p>

      <div className="relative">
        <button
          className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10 bg-white border border-gray-300 p-2 rounded-full"
          onClick={() => scroll('left')}
          disabled={currentPage === 0}
        >
          <ChevronLeft />
        </button>
        <button
          className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 bg-white border border-gray-300 p-2 rounded-full"
          onClick={() => scroll('right')}
          disabled={(currentPage + 1) * coursesPerPage >= courses.length}
        >
          <ChevronRight />
        </button>

        <div ref={scrollRef} className="flex flex-wrap gap-6 pb-4 pr-6">
          {getCurrentCourses().map((course) => (
            <Link
              to={`/student/courses/${course.id}`} // Use course.id instead of slugify(course.courseTitle)
              key={course.id}
              className="w-full sm:w-[48%] md:w-[31%] lg:w-[23%] bg-white rounded-xl shadow transition-transform duration-200 hover:scale-[1.01] overflow-hidden"
            >
              <div className="relative h-[180px] rounded-t-xl overflow-hidden">
                <img
                  src={course.courseThumbnail || 'https://via.placeholder.com/740x180'}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-gray-500 p-2 text-gray-300 rounded-full shadow">
                  <span className="text-sm"><Bookmark /></span>
                </div>
                <div className="absolute bottom-2 left-2 bg-white p-1 rounded-full shadow">
                  <img
                    src="https://img.freepik.com/free-photo/confident-business-woman-portrait-smiling-face_53876-137693.jpg?uid=R160851296&ga=GA1.1.1292176217.1739379214&semt=ais_hybrid&w=740"
                    alt="profile"
                    className="rounded-full w-8 h-8"
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-base mb-1">{course.courseTitle}</h3>
                <span
                  className={`text-xs inline-block mb-2 px-2 py-1 rounded-full ${
                    course.courseLevel === 'Beginner' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                  }`}
                >
                  {course.courseLevel}
                </span>
                <p className="text-sm text-gray-600 mb-2">{course.shortDescription}</p>
                <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                  {course.tags.map((tag, i) => (
                    <span key={i}>{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseList;