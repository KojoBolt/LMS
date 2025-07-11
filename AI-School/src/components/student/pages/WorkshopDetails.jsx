import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig'; // Adjust path if needed
import SlateViewer from '../SlateViewer'; // Make sure this path is correct
import { Clock } from 'lucide-react';

// Helper function to get correct video embed URL
const getEmbedUrl = (url) => {
    if (!url) return null;
    const youtubeMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    if (url.match(/\.(mp4|webm|ogg)$/i)) return url;
    return url;
};

const WorkshopDetails = () => {
    const { workshopId } = useParams();
    const [workshop, setWorkshop] = useState(null);
    const [host, setHost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!workshopId) {
            setError("No workshop ID provided.");
            setLoading(false);
            return;
        }

        const fetchWorkshopAndHost = async () => {
            setLoading(true);
            try {
                // 1. Fetch the workshop document from the 'courses' collection
                const docRef = doc(db, 'courses', workshopId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists() && docSnap.data().contentType === 'workshop') {
                    const workshopData = { id: docSnap.id, ...docSnap.data() };
                    setWorkshop(workshopData);

                    // 2. Fetch the host's data using the createdBy field
                    if (workshopData.createdBy) {
                        const hostRef = doc(db, 'users', workshopData.createdBy);
                        const hostSnap = await getDoc(hostRef);
                        if (hostSnap.exists()) {
                            setHost(hostSnap.data());
                        } else {
                            setHost({ name: 'The Rundown Team' }); // Fallback
                        }
                    }
                } else {
                    setError('Workshop not found.');
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Failed to load the workshop.');
            } finally {
                setLoading(false);
            }
        };

        fetchWorkshopAndHost();
    }, [workshopId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p>Loading workshop...</p></div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p className="text-red-500">{error}</p></div>;
    }

    if (!workshop) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><p>This workshop could not be found.</p></div>;
    }

    return (
        <div className="min-h-screen bg-white lg:ml-[300px] mt-[60px] lg:mt-0 mb-[60px] lg:mb-0">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                             <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                                {workshop.courseCategory}
                            </span>
                            <h1 className="text-4xl font-bold text-gray-900 p-4">{workshop.courseTitle}</h1>
                            <p className="text-lg text-gray-600 mt-2">{workshop.shortDescription}</p>
                        </div>
                        
                        
                        {/* Workshop Sessions/Lessons */}
                        <div className="space-y-10">
                            {workshop.sections && workshop.sections[0]?.lessons.map((lesson, index) => (
                                <div key={lesson.id || index} className="pt-6 border-t first:border-t-0 first:pt-0">
                                    
                                    {lesson.videoUrl && (
                                        <div className="bg-gray-200 rounded-lg aspect-video my-6 flex items-center justify-center overflow-hidden">
                                            <iframe
                                                src={getEmbedUrl(lesson.videoUrl)}
                                                className="w-full h-full"
                                                allow="autoplay; encrypted-media; picture-in-picture"
                                                allowFullScreen
                                                title={lesson.title}
                                            ></iframe>
                                        </div>
                                    )}

                                    <div className="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">{lesson.title}</h3>
                                        <SlateViewer value={lesson.content} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg p-6 sticky top-8 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hosted by</h3>
                            <div className="flex items-center gap-4 mb-6">
                                <img 
                                    src={host?.profilePicUrl || `https://ui-avatars.com/api/?name=${host?.name || 'A'}&background=random&color=fff`} 
                                    alt={host?.name || 'Host'}
                                    className="w-16 h-16 rounded-full object-cover shadow-md"
                                />
                                <div>
                                    <p className="font-bold text-lg">{host?.name || 'AI-School Team'}</p>
                                    <p className="text-sm text-gray-600">{host?.role || 'Instructor'}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-300 pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Clock className="w-5 h-5 text-gray-500" />
                                        <span>On-demand</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <span className="inline-block bg-green-100 text-green-800 font-medium px-2 py-1 rounded">
                                            {workshop.courseLevel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkshopDetails;
