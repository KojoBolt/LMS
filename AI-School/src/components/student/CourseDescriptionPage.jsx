import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, BookOpen, Users, Check, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import SlateViewer from './SlateViewer'; 
import {Link} from 'react-router-dom';  

const formatDuration = (totalMinutes) => {
    if (!totalMinutes || totalMinutes <= 0) {
        return '0m';
    }
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    let durationString = '';
    if (hours > 0) {
        durationString += `${hours}h `;
    }
    if (minutes > 0) {
        durationString += `${minutes}m`;
    }
    return durationString.trim();
};

// --- Accordion  Component ---

const CourseStructureItem = ({ section, isExpanded, onToggle }) => {
    const lectureCount = section.lessons ? section.lessons.length : 0;
    
   
    const sectionDuration = section.lessons 
        ? section.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0)
        : 0;

    return (
        <div className="border border-gray-200 rounded-lg mb-2">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <div className="flex items-center">
                    <span className="text-gray-500 mr-4">
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </span>
                    <span className="text-gray-800 font-medium">{section.title || 'Untitled Section'}</span>
                </div>

                <span className="text-gray-500 text-sm">{lectureCount} lectures - {formatDuration(sectionDuration)}</span>
            </button>
            {isExpanded && (
                <div className="pl-12 pr-4 pb-4">
                    <ul className="space-y-2 text-sm text-gray-600">
                        {section.lessons && section.lessons.map((lesson) => (
        
                            <li key={lesson.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <BookOpen size={14} className="mr-2 text-gray-500"/>
                                    {lesson.title || 'Untitled Lesson'}
                                </div>
                                <span className="text-gray-500">{formatDuration(lesson.duration)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- Price Card Component ---
const PriceCard = ({ course }) => {
    const [showVideo, setShowVideo] = useState(false);
    

    const getDiscountPercentage = (price, discountPrice) => {
        if (!price || !discountPrice || price <= discountPrice) return 0;
        return Math.round(((price - discountPrice) / price) * 100);
    };
    
    const getEmbedUrl = (url) => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        }
        return url; 
    };

    const totalLessons = course.sections ? course.sections.reduce((acc, section) => acc + (section.lessons ? section.lessons.length : 0), 0) : 0;
    const totalCourseDurationMinutes = course.sections
        ? course.sections.reduce((total, section) => 
            total + (section.lessons ? section.lessons.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) : 0), 0)
        : 0;

    const discountPercentage = getDiscountPercentage(course.coursePrice, course.discountPrice);
    const videoEmbedUrl = getEmbedUrl(course.courseVideoUrl);

    return (
        <div className="bg-gray-50 shadow-lg sticky top-4">
            <div className="relative h-48 overflow-hidden bg-black flex justify-center items-center">
                {showVideo && videoEmbedUrl ? (
                    <iframe
                        src={videoEmbedUrl}
                        title={course.courseTitle}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                ) : (
                    <>
                        <img 
                            src={course.courseThumbnail || 'https://placehold.co/600x400/eee/ccc?text=Course+Image'} 
                            alt={course.courseTitle} 
                            className="w-full h-full object-cover"
                        />
                        {videoEmbedUrl && (
                            <button
                                onClick={() => setShowVideo(true)}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 transition-opacity opacity-75 hover:opacity-100 focus:outline-none"
                                aria-label="Preview this course"
                            >
                                <PlayCircle size={64} className="text-white" />
                                <span className="text-white font-semibold mt-2">Preview this course</span>
                            </button>
                        )}
                    </>
                )}
            </div>
            <div className="p-6">
                <div className="flex items-center mb-4">
                    {course.isFree ? (
                        <span className="text-[18px] font-bold text-gray-800">Free</span>
                    ) : (
                        <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-gray-800">${course.discountPrice || course.coursePrice}</span>
                            {course.hasDiscount && (
                                <span className="text-gray-500 line-through ml-2">${course.coursePrice}</span>
                            )}
                            {discountPercentage > 0 && (
                                <span className="bg-green-100 text-green-700 font-medium ml-3 px-2 py-1 rounded-full text-sm">{discountPercentage}% off</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4 space-x-4 py-4">
                    <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>4.5</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDuration(totalCourseDurationMinutes)}</span>
                    </div>
                    <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1" />
                        <span>{totalLessons} lessons</span>
                    </div>
                </div>
                <div className='p-5 m-auto'>
                <Link to={`/student/checkout/${course.id}`} className="w-full bg-blue-600 text-white py-4 px-[100px] rounded-lg font-medium hover:bg-blue-700 transition-colors mb-6 m-auto">
                Enroll Now
                </Link>                

                </div>
                
                <div>
                    <h4 className="font-semibold text-gray-800 mb-3">What's in the course?</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        {course.learningOutcomes && course.learningOutcomes.map((outcome, index) => (
                             <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2 mt-1"><Check size={16}/></span>
                                {outcome}
                             </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const CourseDescriptionPage = () => {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    useEffect(() => {
        if (!courseId) {
            setError("No course ID provided.");
            setLoading(false);
            return;
        }

        const fetchCourse = async () => {
            setLoading(true);
            try {
                const courseDocRef = doc(db, 'courses', courseId);
                const docSnap = await getDoc(courseDocRef);

                if (docSnap.exists()) {
                    setCourse({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setError('Course not found.');
                }
            } catch (err) {
                console.error("Error fetching course:", err);
                setError('Failed to load course data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleToggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p>Loading course...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p className="text-red-500">{error}</p></div>;
    }
    
    if (!course) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p>No course data available.</p></div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#DDFBFE] via-[#DDFBFE] to-[#FCFCFC] ml-[300px]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="p-8 mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.courseTitle}</h1>
                            <p className="text-gray-600 mb-4">{course.shortDescription}</p>
                            <div className="flex items-center mb-4">
                                {/* Static rating/students for now */}
                                <div className="flex items-center mr-4">
                                    {[...Array(4)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                                    <Star className="w-4 h-4 text-gray-300" />
                                    <span className="text-sm text-gray-600 ml-2">(4 ratings)</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Users className="w-4 h-4 mr-1" />
                                    <span>{course.maxStudents || 0} students</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600">
                                Course by <span className="text-blue-600 underline">Instructor Name</span>
                            </div>
                        </div>
                        
                        {/* Course Structure Accordion */}
                        <div className="p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Structure</h2>
                            <div>
                                {course.sections && course.sections.map((section) => (
                                    <CourseStructureItem 
                                        key={section.id}
                                        section={section}
                                        isExpanded={!!expandedSections[section.id]}
                                        onToggle={() => handleToggleSection(section.id)}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        {/* Course Description */}
                        <div className="p-8 prose max-w-none">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Course Description</h2>
                            <SlateViewer value={course.courseDescription} />
                        </div>
                    </div>
                    
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <PriceCard course={course} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDescriptionPage;
