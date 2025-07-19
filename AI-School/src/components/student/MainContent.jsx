import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import badgeImage from "../../assets/images/badge.png"; 
import { useTheme } from '../../context/ThemeContext';

const MainContent = ({ enrolledCourses }) => {
    const scrollRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);
    const coursesPerPage = 3;
    const { theme } = useTheme();

    const coursesToDisplay = enrolledCourses.filter(course => 
        !course.contentType || course.contentType === 'course'
    );

    const scroll = (direction) => {
        if (direction === "left" && currentPage > 0) {
            setCurrentPage(currentPage - 1);
        } else if (direction === "right" && (currentPage + 1) * coursesPerPage < coursesToDisplay.length) {
            setCurrentPage(currentPage + 1);
        }
    };

    const getCurrentCourses = () => {
        const startIndex = currentPage * coursesPerPage;
        return coursesToDisplay.slice(startIndex, startIndex + coursesPerPage);
    };
    
    const textColor = theme === 'dark' ? 'text-black' : 'text-black';
    const cardBg = theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-100';
    // const borderBg = theme === 'dark' ? 'border border-gray-50' : 'border border-gray-200'
    const shadowBG = theme === 'dark' ? 'shadow-lg' : 'border border-gray-300'


    const badgeColor = "bg-blue-200"; 

    // If there are no courses to display after filtering, render nothing.
    if (!coursesToDisplay || coursesToDisplay.length === 0) {
        return null;
    }

    return (
        <div className="w-full mt-[25px]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Continue where you left off</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        className= {`p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50`}
                        disabled={currentPage === 0}
                    >
                        <ChevronLeft size={20} className={`${textColor}`}/>
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 disabled:opacity-50"
                        disabled={(currentPage + 1) * coursesPerPage >= coursesToDisplay.length}
                    >
                        <ChevronRight size={20} className={`${textColor}`} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-2"
            >
                {getCurrentCourses().map((course) => (
                    <Link
                        to={`/student/courses/${course.id}`}
                        key={course.id}
                        className={`bg-white rounded-xl block hover:scale-[1.01] transition-transform ${shadowBG}`}
                    >
                        <div className="bg-black text-white p-4 rounded-t-xl relative min-h-[200px]">
                            <h3 className="text-lg font-semibold mb-2">{course.courseTitle}</h3>
                            <div className="w-[70%]">
                                <p className="text-sm mb-6">
                                    {course.shortDescription && course.shortDescription.split(' ').length > 20 
                                        ? course.shortDescription.split(' ').slice(0, 10).join(' ') + '...'
                                        : course.shortDescription
                                    }
                                </p>
                            </div>
                            <button className={`px-3 py-1 border rounded border-indigo-500 text-white text-sm`}>
                                Continue Course
                            </button>
                            <div className={`absolute top-0 right-0 h-full w-28 ${badgeColor} flex items-center justify-center text-[10px] font-semibold text-center mr-4 max-w-[100px] [clip-path:polygon(0_0,100%_0,100%_90%,50%_100%,0_90%)]`}>
                                <div className='text-[15px] text-black '>
                                    {course.courseCategory}
                                </div>
                                <div className="mt-[60px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <img src={badgeImage} alt="badge" className="w-12 h-12 " />
                                </div>
                            </div>
                        </div>
                        <div className={`p-4 rounded-b-xl ${cardBg}`}>
                            <div className="text-sm text-black mb-1 bg-[#E3E3E3] p-1 w-[100px] rounded-2xl text-center">
                                Course
                            </div>
                            <div className="text-sm font-medium">{course.courseTitle}</div>
                            <div className="text-xs text-gray-500">{course.courseLevel}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default MainContent;
