import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const courses = [
  {
    title: "AI for Marketing",
    category: "Marketing",
    color: "border-orange-500 text-orange-500",
    badge: "AI FOR MARKETING CERTIFICATION",
  },
  {
    title: "AI Starter Kit",
    category: "General",
    color: "border-indigo-500 text-indigo-500",
    badge: "AI STARTER KIT CERTIFICATION",
  },
  {
    title: "AI for Finance",
    category: "Finance",
    color: "border-emerald-500 text-emerald-500",
    badge: "AI FOR FINANCE CERTIFICATION",
  },
  {
    title: "AI for Finance",
    category: "Finance",
    color: "border-emerald-500 text-emerald-500",
    badge: "AI FOR FINANCE CERTIFICATION",
  },
];

const MainContent = () => {
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 3;

    // Function to handle scrolling left or right
    

const scroll = (direction) => {
    if (direction === "left" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (direction === "right" && (currentPage + 1) * coursesPerPage < courses.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getCurrentCourses = () => {
    const startIndex = currentPage * coursesPerPage;
    return courses.slice(startIndex, startIndex + coursesPerPage);
  };

  return (
    <div className="w-full mt-[25px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Continue where you left off</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2 overflow-x-hidden no-scrollbar overflow-hidden"
      >
        {getCurrentCourses().map((course, idx) => (
          <Link
          to={`/student/courses/${course.title.toLowerCase().replace(/\s+/g, '-')}`}
          state={{ course }}
          key={idx}
          className="bg-white rounded-xl block hover:scale-[1.01] transition-transform"
        >
          <div className="bg-black text-white p-4 rounded-t-xl relative min-h-[200px]">
            <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
            <p className="text-sm mb-6">
              Learn the fundamentals of leveraging {course.title}
            </p>
            <button className={`px-3 py-1 border rounded ${course.color} text-sm`}>
              Get Certification
            </button>
            <span
              className={`absolute top-4 right-4 text-xs font-medium bg-white px-2 py-1 rounded ${course.color}`}
            >
              {course.badge}
            </span>
          </div>
          <div className="bg-gray-100 p-4 rounded-b-xl">
            <div className="text-sm text-black mb-1 bg-[#E3E3E3] p-1 w-[100px] rounded-2xl text-center">
              Course
            </div>
            <div className="text-sm font-medium">{course.title}</div>
            <div className="text-xs text-gray-500">{course.category}</div>
          </div>
</Link>

        ))}
        </div>
    </div>
  );
};

export default MainContent;
