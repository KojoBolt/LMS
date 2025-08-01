import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig'; 
import SlateViewer from './SlateViewer'; 
import { useTheme } from '../../context/ThemeContext'; 

// Helper function to create a placeholder for the instructor image
const getInstructorAvatar = (name) => {
    if (!name) return 'https://placehold.co/48x48/E3E3E3/000000?text=A';
    const initials = name.split(' ').map(n => n[0]).join('');
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
}

// Helper function to get correct video embed URL
const getEmbedUrl = (url) => {
    if (!url) return null;
    const youtubeMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    if (url.match(/\.(mp4|webm|ogg)$/i)) return url;
    return url; // Return the original URL if it's not a known video platform
};

const GuideDetails = () => {
    const { guideId } = useParams();
    const [guide, setGuide] = useState(null);
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { theme } = useTheme(); 


    const containerBg = theme === 'dark' ? 'bg-[#171717]' : 'bg-gray-100';
    const textColor = theme === 'dark' ? 'text-white' : 'text-gray-700';
    const errorTextColor = theme === 'dark' ? 'text-red-400' : 'text-red-500';
    const spinnerColor = theme === 'dark' ? 'border-white' : 'border-black';
    const editorBg = theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-gray-50'
    const iconColor = theme === 'dark' ? 'text-[#fff]' : 'bg-text-gray-600' 
    const progressBG = theme === 'dark' ? 'bg-white' : 'bg-black'
    const progressColor = theme === 'dark' ? 'bg-[#404040]' : 'bg-gray-200'


    useEffect(() => {
        if (!guideId) {
            setError("No guide ID provided.");
            setLoading(false);
            return;
        }

        const fetchGuideAndInstructor = async () => {
            setLoading(true);
            try {
                // Step 1: Fetch the guide document
                const docRef = doc(db, 'courses', guideId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().contentType === 'guide') {
                    const guideData = { id: docSnap.id, ...docSnap.data() };
                    setGuide(guideData);

                    // Step 2: Fetch the instructor's data using the createdBy field
                    if (guideData.createdBy) {
                        const instructorRef = doc(db, 'users', guideData.createdBy);
                        const instructorSnap = await getDoc(instructorRef);
                        if (instructorSnap.exists()) {
                            setInstructor(instructorSnap.data());
                        } else {
                            console.warn("Instructor document not found.");
                            setInstructor({ name: 'Admin User', role: 'Instructor' }); // Fallback
                        }
                    }
                } else {
                    setError('Guide not found.');
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load the guide.');
            } finally {
                setLoading(false);
            }
        };

        fetchGuideAndInstructor();
    }, [guideId]);

    if (loading) {
        return <div className={`flex justify-center items-center h-screen lg:ml-[300px] ${containerBg}`}>
                <div className={`w-12 h-12 border-4 ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
            </div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p className="text-red-500">{error}</p></div>;
    }

    if (!guide) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p>This guide could not be found.</p></div>;
    }

    return (
        <div className={`min-h-screen ${containerBg} lg:ml-[300px] mb-[60px] lg:mb-0 mt-[60px] lg:mt-0`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textColor} mb-4 sm:mb-6`}>{guide.courseTitle}</h1>
                
                <div className="space-y-8 sm:space-y-10 md:space-y-12">
                    {guide.sections && guide.sections[0]?.lessons.map(lesson => (
                        <div key={lesson.id}>
                            
                            {lesson.videoUrl && (
                                <div className="bg-black rounded-lg aspect-video my-4 sm:my-6 flex items-center justify-center overflow-hidden">
                                    <iframe
                                        src={getEmbedUrl(lesson.videoUrl)}
                                        className="w-full h-full"
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                        title={lesson.title}
                                    ></iframe>
                                </div>
                            )}

                            <div className={`prose max-w-none ${editorBg} p-4 sm:p-5 md:p-6 rounded-lg border border-gray-200 ${textColor}`}>
                                <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold ${textColor} mb-3 sm:mb-4`}>{lesson.title}</h2>
                                <SlateViewer 
                                value={lesson.content} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
                <div className={`${editorBg} rounded-lg p-4 sm:p-5 md:p-6 lg:sticky lg:top-8 mt-0 lg:mt-[60px] border border-gray-200 max-w-2xl`}>
                    <h3 className={`text-base sm:text-lg font-semibold ${textColor} mb-3 sm:mb-4`}>Instructor</h3>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <img 
                            src={instructor?.profilePicUrl || getInstructorAvatar(instructor?.name)} 
                            alt={instructor?.name || 'Instructor'}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className={`font-semibold text-sm sm:text-base ${textColor}`}>{instructor?.name || 'Admin'}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{instructor?.role || 'Instructor'}</p>
                        </div>
                    </div>
                    <hr className='my-4 sm:my-6 border-gray-200' />

                    <h3 className={`text-sm sm:text-[16px] font-semibold ${textColor} mb-3 sm:mb-4`}>Categories</h3>
                    <div className="flex flex-wrap gap-2">
                        {guide.tags && guide.tags.map(tag => (
                            <span key={tag} className="bg-gray-200 text-gray-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
    );
};

export default GuideDetails;
