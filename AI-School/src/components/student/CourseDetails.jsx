import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
// Import Firebase services from the CDN
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import SlateViewer from './SlateViewer'; 

// --- Firebase Configuration ---
// These variables are provided by the environment.
// Fallback: Try to get config from window if not defined as global variable
const firebaseConfig = (typeof __firebase_config !== 'undefined' && __firebase_config)
    ? (typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config)
    : (window && window.__firebase_config ? window.__firebase_config : {});
const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
    ? __initial_auth_token 
    : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const CourseDetails = () => {
    const { courseId } = useParams();
    // State for Firebase services and data
    const [db, setDb] = useState(null);
    const [course, setCourse] = useState(null);

    // Re-run when courseId changes: reset course and navigation state
    useEffect(() => {
      setCourse(null);
      setCurrentSectionIndex(0);
      setCurrentLessonIndex(0);
    }, [courseId]);

    // Fetch a single, specific course by courseId
    useEffect(() => {
      if (!db || !courseId) return;

      const fetchCourseById = async () => {
      setLoading(true);
      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
        setError('Course not found.');
        setCourse(null);
        } else {
        setCourse({ id: courseSnap.id, ...courseSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching course by ID:", err);
        setError('Failed to load the course. Please try again later.');
      } finally {
        setLoading(false);
      }
      };

      fetchCourseById();
    }, [db, courseId]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for navigation within the course
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

    // Effect for Initializing Firebase
    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                // Check if a Firebase app is already initialized. If not, initialize one.
                const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
                const auth = getAuth(app);
                const firestore = getFirestore(app);

                // Sign in the user if not already signed in
                if (!auth.currentUser) {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        // Anonymous sign-in is not enabled or allowed; skip or handle gracefully
                        setError("Anonymous authentication is not enabled. Please contact the administrator.");
                        setLoading(false);
                        return;
                    }
                }
                
                // Set the firestore instance in state
                setDb(firestore);
                console.log("Current lesson data:", getCurrentLesson());
            } catch (err) {
                console.error("Firebase Initialization Error:", err);
                // Set a more generic error for the user, but log the specific one.
                setError("Could not connect to the database. Please check the configuration.");
                setLoading(false);
            }
        };

        initializeFirebase();
    }, []);


    // --- Navigation and Helper Functions ---

    const goToPreviousLesson = () => {
        if (!course) return;
        if (currentLessonIndex > 0) {
            setCurrentLessonIndex(currentLessonIndex - 1);
        } else if (currentSectionIndex > 0) {
            const newSectionIndex = currentSectionIndex - 1;
            setCurrentSectionIndex(newSectionIndex);
            // Go to the last lesson of the previous section
            setCurrentLessonIndex(course.sections[newSectionIndex].lessons.length - 1);
        }
    };

    const goToNextLesson = () => {
        if (!course) return;
        const currentSection = course.sections[currentSectionIndex];
        if (currentLessonIndex < currentSection.lessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
        } else if (currentSectionIndex < course.sections.length - 1) {
            // Move to the first lesson of the next section
            setCurrentSectionIndex(currentSectionIndex + 1);
            setCurrentLessonIndex(0);
        }
    };
    
    const getCurrentLesson = () => {
        if (!course || !course.sections || course.sections.length === 0) return null;
        const section = course.sections[currentSectionIndex];
        if (!section || !section.lessons || section.lessons.length === 0) return null;
        return section.lessons[currentLessonIndex];
    };

    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'www.youtube.com/embed/');
        }
        return url; // Assume it's already an embeddable or direct URL
    };

    // --- Render Logic ---
    
    const currentLesson = getCurrentLesson();

    console.log("Checking Lesson:", currentLesson?.title, "Video URL:", currentLesson?.videoUrl);


    if (loading) {
        return <div className="flex justify-center items-center min-h-screen ml-[300px]"><p>Loading course...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen ml-[300px]"><p className="text-red-500">{error}</p></div>;
    }
    
    if (!course) {
        return <div className="flex justify-center items-center min-h-screen ml-[300px]"><p>No course available.</p></div>;
    }
    
    const totalLessons = course.sections.reduce((acc, section) => acc + (section.lessons ? section.lessons.length : 0), 0);
    const completedLessons = 0; // You can implement completion tracking later
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const isFirstLesson = currentSectionIndex === 0 && currentLessonIndex === 0;
    const isLastLesson = course.sections.length > 0 && currentSectionIndex === course.sections.length - 1 && currentLessonIndex === course.sections[course.sections.length - 1].lessons.length - 1;

    return (
        <div className="min-h-screen bg-gray-50 ml-[300px]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.courseTitle}</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-black rounded-lg aspect-video mb-6 flex items-center justify-center overflow-hidden">
    {currentLesson && currentLesson.videoUrl ? (
        <iframe
            key={currentLesson.id || currentLessonIndex} 
            src={getEmbedUrl(currentLesson.videoUrl)}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={currentLesson.title || "Course Video"}
        ></iframe>
    ) : (
        <div className="text-white text-xl flex items-center justify-center h-full">
            No Video Available for This Lesson
        </div>
    )}
</div>

                        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <GraduationCap className="w-6 h-6 text-gray-600" />
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    {currentLesson ? currentLesson.title : 'No lesson selected'}
                                </h2>
                            </div>
                            
                    <div className="text-gray-700 text-lg leading-relaxed mb-6 prose max-w-none">
                            {currentLesson?.content ? (
                                <SlateViewer
                                    key={currentLesson.id} // The key is vital for navigation
                                    value={currentLesson.content}
                                />
                            ) : (
                                <p>{course.shortDescription}</p> // A fallback for lessons with no content
                            )}
                        </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={goToPreviousLesson}
                                    disabled={isFirstLesson}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous Lesson
                                </button>
                                
                                <button
                                    onClick={goToNextLesson}
                                     disabled={isLastLesson}
                                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next Lesson
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-900">Course progress</h3>
                                <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-black h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course content</h3>
                            
                            <div className="space-y-4">
                                {course.sections && course.sections.map((section, secIndex) => (
                                    <div key={section.id || secIndex}>
                                        <h4 className="font-bold text-gray-800 mb-2">{section.title}</h4>
                                        <div className="space-y-2">
                                            {section.lessons && section.lessons.map((lesson, lesIndex) => (
                                                <div
                                                    key={lesson.id || lesIndex}
                                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                        secIndex === currentSectionIndex && lesIndex === currentLessonIndex
                                                            ? 'bg-blue-50 border border-blue-200'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                    onClick={() => {
                                                        setCurrentSectionIndex(secIndex);
                                                        setCurrentLessonIndex(lesIndex);
                                                    }}
                                                >
                                                    <div className="text-sm font-medium bg-gray-100 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                                                        {lesIndex + 1}
                                                    </div>
                                                    <span className={`flex-1 text-sm ${
                                                        secIndex === currentSectionIndex && lesIndex === currentLessonIndex ? 'font-medium text-blue-900' : 'text-gray-700'
                                                    }`}>
                                                        {lesson.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;