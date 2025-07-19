import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, GraduationCap, CheckCircle } from 'lucide-react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit, doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import SlateViewer from './SlateViewer'; 
import { useTheme } from '../../context/ThemeContext'; 


// Firebase config and initial tokens remain the same...
const firebaseConfig = (typeof __firebase_config !== 'undefined' && __firebase_config)
    ? (typeof __firebase_config === 'string' ? JSON.parse(__firebase_config) : __firebase_config)
    : (window && window.__firebase_config ? window.__firebase_config : {});
const initialAuthToken = typeof __initial_auth_token !== 'undefined' 
    ? __initial_auth_token 
    : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';


const CourseDetails = () => {
    const { courseId } = useParams();
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [authLoading, setAuthLoading] = useState(true); // NEW: Track auth loading state
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
    const { theme } = useTheme(); 

    // NEW: State to track IDs of completed lessons. A Set is used for efficient add/check operations.
    const [completedLessons, setCompletedLessons] = useState(new Set());

    const containerBg = theme === 'dark' ? 'bg-[#171717]' : 'bg-gray-100';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-700';
    const errorTextColor = theme === 'dark' ? 'text-red-400' : 'text-red-500';
    const spinnerColor = theme === 'dark' ? 'border-white' : 'border-black';
    const editorBg = theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-[#FFFFFF]'
    const iconColor = theme === 'dark' ? 'text-[#fff]' : 'bg-text-gray-600' 
    const progressBG = theme === 'dark' ? 'bg-white' : 'bg-black'
    const progressColor = theme === 'dark' ? 'bg-[#404040]' : 'bg-gray-200'

    useEffect(() => {
        // Reset state when courseId changes
        setCourse(null);
        setCurrentSectionIndex(0);
        setCurrentLessonIndex(0);
        setCompletedLessons(new Set()); // Reset progress
    }, [courseId]);

    
    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
                const firestore = getFirestore(app);
                const authInstance = getAuth(app);

                setDb(firestore);
                setAuth(authInstance);

                // NEW: Listen to auth state changes instead of checking immediately
                const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                    if (user) {
                        // User is signed in
                        setAuthLoading(false);
                    } else {
                        // No user, try to authenticate
                        try {
                            if (initialAuthToken) {
                                await signInWithCustomToken(authInstance, initialAuthToken);
                            } else {
                                // Handle anonymous sign-in or error as before
                                setError("Authentication is required.");
                                setAuthLoading(false);
                                setLoading(false);
                                return;
                            }
                        } catch (authError) {
                            console.error("Authentication Error:", authError);
                            setError("Authentication failed.");
                            setAuthLoading(false);
                            setLoading(false);
                        }
                    }
                });

                // Return cleanup function to unsubscribe when component unmounts
                return unsubscribe;
            } catch (err) {
                console.error("Firebase Initialization Error:", err);
                setError("Could not connect to the database.");
                setAuthLoading(false);
                setLoading(false);
            }
        };

        const unsubscribe = initializeFirebase();
        
        // Cleanup function
        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    // NEW: useEffect to fetch user progress after Firebase and course are ready
    useEffect(() => {
        if (!db || !auth || !auth.currentUser || !course || authLoading) return;

        const fetchProgress = async () => {
            const userId = auth.currentUser.uid;
            const progressRef = doc(db, 'userProgress', `${userId}_${course.id}`);
            const progressSnap = await getDoc(progressRef);

            if (progressSnap.exists()) {
                const progressData = progressSnap.data();
                // Load completed lessons into the Set
                setCompletedLessons(new Set(progressData.completed || []));
            }
        };

        fetchProgress();
    }, [db, auth, course, authLoading]);


    useEffect(() => {
        // MODIFIED: Don't fetch course if auth is still loading
        if (!db || !courseId || authLoading) return;

        const fetchCourseById = async () => {
        setLoading(true);
        try {
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);

            if (!courseSnap.exists()) {
            setError('Course not found.');
            setCourse(null);
            } else {
            // Ensure lessons have unique IDs, which are crucial for progress tracking
            const courseData = courseSnap.data();
            courseData.sections.forEach(section => {
                section.lessons.forEach((lesson, index) => {
                    if (!lesson.id) lesson.id = `${section.id}-${index}`;
                });
            });
            setCourse({ id: courseSnap.id, ...courseData });
            }
        } catch (err) {
            console.error("Error fetching course by ID:", err);
            setError('Failed to load the course.');
        } finally {
            setLoading(false);
        }
        };

        fetchCourseById();
    }, [db, courseId, authLoading]);

    const getCurrentLesson = () => {
        if (!course || !course.sections || course.sections.length === 0) return null;
        const section = course.sections[currentSectionIndex];
        if (!section || !section.lessons || section.lessons.length === 0) return null;
        return section.lessons[currentLessonIndex];
    };
    
    const currentLesson = getCurrentLesson();

    // NEW: Function to mark a lesson as complete or incomplete
    const handleToggleComplete = async () => {
        if (!auth.currentUser || !currentLesson) return;

        const userId = auth.currentUser.uid;
        const lessonId = currentLesson.id;
        const progressRef = doc(db, 'userProgress', `${userId}_${course.id}`);
        
        const isCompleted = completedLessons.has(lessonId);

        try {
            if (isCompleted) {
                // Mark as incomplete
                await setDoc(progressRef, { completed: arrayRemove(lessonId) }, { merge: true });
                const newCompleted = new Set(completedLessons);
                newCompleted.delete(lessonId);
                setCompletedLessons(newCompleted);
            } else {
                // Mark as complete
                await setDoc(progressRef, { completed: arrayUnion(lessonId) }, { merge: true });
                const newCompleted = new Set(completedLessons);
                newCompleted.add(lessonId);
                setCompletedLessons(newCompleted);
            }
        } catch (error) {
            console.error("Failed to update progress:", error);
            setError("Couldn't save your progress. Please try again.");
        }
    };
    
    // MODIFIED: goToNextLesson now automatically marks the current lesson as complete
    const goToNextLesson = async () => {
        if (!course || !currentLesson) return;

        // Automatically mark the current lesson as complete if it's not already
        if (!completedLessons.has(currentLesson.id)) {
            await handleToggleComplete();
        }
        
        const currentSection = course.sections[currentSectionIndex];
        if (currentLessonIndex < currentSection.lessons.length - 1) {
            setCurrentLessonIndex(currentLessonIndex + 1);
        } else if (currentSectionIndex < course.sections.length - 1) {
            setCurrentSectionIndex(currentSectionIndex + 1);
            setCurrentLessonIndex(0);
        }
    };

    const goToPreviousLesson = () => {
        if (!course) return;
        if (currentLessonIndex > 0) {
            setCurrentLessonIndex(currentLessonIndex - 1);
        } else if (currentSectionIndex > 0) {
            const newSectionIndex = currentSectionIndex - 1;
            setCurrentSectionIndex(newSectionIndex);
            setCurrentLessonIndex(course.sections[newSectionIndex].lessons.length - 1);
        }
    };

    // ... getEmbedUrl function remains the same ...
    const getEmbedUrl = (url) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'youtube.com/embed/');
        }
        return url; 
    };

    // MODIFIED: Show loading while either course or auth is loading
    if (loading || authLoading) {
        return (
            <div className={`flex justify-center items-center h-screen lg:ml-[300px] ${containerBg}`}>
                <div className={`w-12 h-12 border-4 ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
            </div>
        );
    }

    if (error) {
        return <div className="flex justify-center items-center min-h-screen ml-[300px]"><p className="text-red-500">{error}</p></div>;
    }
    
    if (!course) {
        return <div className="flex justify-center items-center min-h-screen ml-[300px]"><p>No course available.</p></div>;
    }
    
    
    // DYNAMIC PROGRESS: These calculations are now based on state
    const totalLessons = course.sections.reduce((acc, section) => acc + (section.lessons ? section.lessons.length : 0), 0);
    const progressPercentage = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;
    const isFirstLesson = currentSectionIndex === 0 && currentLessonIndex === 0;
    const isLastLesson = course.sections.length > 0 && currentSectionIndex === course.sections.length - 1 && currentLessonIndex === course.sections[course.sections.length - 1].lessons.length - 1;
    const isCurrentLessonCompleted = currentLesson && completedLessons.has(currentLesson.id);

    return (
    <div className={`min-h-screen ${containerBg} lg:ml-[300px] sm:mt-[60px] mt-[60px] lg:mt-0`}>
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textColor} mb-2`}>{course.courseTitle}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2">
                <div className="bg-black rounded-lg aspect-video mb-4 sm:mb-6 flex items-center justify-center overflow-hidden">
                    {/* Video player remains the same */}
                    {currentLesson && currentLesson.videoUrl ? (
                        <iframe
                            key={currentLesson.id} 
                            src={getEmbedUrl(currentLesson.videoUrl)}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            title={currentLesson.title || "Course Video"}
                        ></iframe>
                    ) : (
                        <div className="text-white text-lg sm:text-xl flex items-center justify-center h-full">
                            No Video Available
                        </div>
                    )}
                </div>

                <div className={`rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 border border-gray-400 ${editorBg}`}>
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <GraduationCap className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
                        <h2 className={`text-lg sm:text-xl md:text-2xl font-semibold ${textColor}`}>
                            {currentLesson ? currentLesson.title : 'No lesson selected'}
                        </h2>
                    </div>
                    
                    <div className={`${textColor} text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 prose max-w-none`}>
                        {/* SlateViewer remains the same */}
                        {currentLesson?.content ? (
                            <SlateViewer
                                key={currentLesson.id} 
                                value={currentLesson.content}
                                className="prose prose-lg max-w-none"
                            />
                        ) : (
                            <p>{course.shortDescription}</p> 
                        )}
                    </div>

                    {/* MODIFIED: Navigation buttons now include a Mark as Complete button */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between items-center gap-3 sm:gap-4">
                        <button
                            onClick={goToPreviousLesson}
                            disabled={isFirstLesson}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        
                        {currentLesson && (
                            <button
                                onClick={handleToggleComplete}
                                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                                    isCurrentLessonCompleted 
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            >
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                {isCurrentLessonCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                            </button>
                        )}

                        <button
                            onClick={goToNextLesson}
                            disabled={isLastLesson}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            Next Lesson
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-1">
                {/* DYNAMIC: Progress bar UI now uses dynamic values */}
                <div className={`${editorBg} rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 border border-gray-400`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className={`text-base sm:text-lg font-semibold ${textColor}`}>Course Progress</h3>
                        <span className="text-xs sm:text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
                    </div>
                    <div className={`w-full ${progressColor} rounded-full h-2`}>
                        <div className={`${progressBG} h-2 rounded-full`} style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>

                <div className={`${editorBg} rounded-lg p-4 sm:p-5 md:p-6 border border-gray-400 mb-16 lg:mb-0`}>
                    <h3 className={`text-base sm:text-lg font-semibold ${textColor} mb-3 sm:mb-4`}>Course Content</h3>
                    
                    <div className="space-y-3 sm:space-y-4">
                        {course.sections && course.sections.map((section, secIndex) => (
                            <div key={section.id || secIndex}>
                                <h4 className="font-bold text-gray-800 mb-2 text-sm sm:text-base">{section.title}</h4>
                                <div className="space-y-2">
                                    {section.lessons && section.lessons.map((lesson, lesIndex) => {
                                        // DYNAMIC: Check if the lesson is completed
                                        const isCompleted = completedLessons.has(lesson.id);
                                        return (
                                            <div
                                                key={lesson.id}
                                                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-colors ${
                                                    secIndex === currentSectionIndex && lesIndex === currentLessonIndex
                                                        ? 'bg-blue-50 border border-blue-200'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                                onClick={() => {
                                                    setCurrentSectionIndex(secIndex);
                                                    setCurrentLessonIndex(lesIndex);
                                                }}
                                            >
                                                {/* NEW: Display a checkmark icon for completed lessons */}
                                                {isCompleted ? (
                                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                                                ) : (
                                                    <div className="text-xs sm:text-sm font-medium bg-gray-100 text-gray-600 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center flex-shrink-0">
                                                        {lesIndex + 1}
                                                    </div>
                                                )}
                                                <span className={`flex-1 text-xs sm:text-sm ${
                                                    secIndex === currentSectionIndex && lesIndex === currentLessonIndex ? 'font-medium text-blue-900' : 'text-gray-700'
                                                } ${isCompleted ? 'text-gray-500' : ''}`}>
                                                    {lesson.title}
                                                </span>
                                            </div>
                                        );
                                    })}
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