import React from "react";
import { Link } from "react-router-dom"; // ✅ Import this
import { Bookmark, LockKeyhole, GraduationCap } from "lucide-react";

// Helper to slugify titles for URL
const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-");

const courses = [
  {
    title: "AI Starter Kit",
    description: "Learn the fundamentals of leveraging AI Starter Kit",
    category: "General",
    badgeColor: "bg-purple-200",
    badgeText: "AI STARTER KIT CERTIFICATION",
    certColor: "border-indigo-400 text-indigo-400",
    locked: false,
  },
  {
    title: "AI for Coding",
    description: "Learn the fundamentals of leveraging AI for Coding",
    category: "Coding",
    badgeColor: "bg-blue-200",
    badgeText: "AI FOR CODING CERTIFICATION",
    certColor: "border-blue-400 text-blue-400",
    locked: true,
  },
  {
    title: "AI for Marketing",
    description: "Learn the fundamentals of leveraging AI for Marketing",
    category: "Marketing",
    badgeColor: "bg-orange-200",
    badgeText: "AI FOR MARKETING CERTIFICATION",
    certColor: "border-orange-400 text-orange-400",
    locked: true,
  },
  {
    title: "AI for Content Creation",
    description: "Learn the fundamentals of leveraging AI for Content Creation",
    category: "Content",
    badgeColor: "bg-orange-200",
    badgeText: "AI FOR CONTENT CREATION CERTIFICATION",
    certColor: "border-orange-400 text-orange-400",
    locked: true,
  },
  {
    title: "AI for Education",
    description: "Learn the fundamentals of leveraging AI for Education",
    category: "Education",
    badgeColor: "bg-green-200",
    badgeText: "AI FOR EDUCATION CERTIFICATION",
    certColor: "border-green-400 text-green-400",
    locked: true,
  },
  {
    title: "AI for Business Operations",
    description: "Learn the fundamentals of leveraging AI for Business Operations",
    category: "Operations",
    badgeColor: "bg-purple-200",
    badgeText: "AI FOR BUSINESS OPERATIONS CERTIFICATION",
    certColor: "border-purple-400 text-purple-400",
    locked: true,
  },
];

const Courses = () => {
  return (
    <div className="p-8 max-w-7xl ml-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Courses</h2>
        <button className="text-sm px-4 py-2 border border-gray-400 rounded-full hover:bg-gray-100">Clear filters</button>
      </div>

      <div className="mb-6">
        <select className="border rounded-lg px-4 py-2 text-sm">
          <option>All categories</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, idx) => (
          <Link
            to={`/student/courses/${slugify(course.title)}`} // ✅ Full card click
            key={idx}
            className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition duration-200 cursor-pointer"
          >
            <div className="relative bg-black text-white p-4">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-sm mb-4">{course.description}</p>
              <button
                className={`text-sm border px-4 py-1 rounded ${course.certColor}`}
              >
                Get Certification
              </button>
              <div className={`absolute top-0 right-0 h-full w-28 ${course.badgeColor} flex items-center justify-center text-[10px] font-semibold text-center p-2`}> 
              </div>
              <div className="absolute top-2 right-2">
                <Bookmark size={18} />
              </div>
              {course.locked && (
                <div className="absolute top-2 right-10 w-8 h-8 p-2 bg-gray-600 rounded-full flex items-center justify-center">
                  <LockKeyhole size={18} />
                </div>
              )}
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-sm mb-1">{course.title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <span className="bg-gray-200 px-2 py-0.5 rounded-full flex gap-1">
                  <GraduationCap size={14} />Certificate
                </span>
              </div>
              <p className="text-xs text-gray-500">{course.category}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Courses;
