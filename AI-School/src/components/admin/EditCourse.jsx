import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebaseConfig'; 
import { ChevronLeft, ChevronRight, Pencil, Trash2, FolderOpen, Plus, CirclePlay, CheckCircle } from 'lucide-react';
// import LexicalEditor from './LexicalEditor'; 
import SlateEditor from './SlateEditor'; 


const SuccessModal = ({ onConfirm }) => (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-auto text-center transform transition-all scale-100 opacity-100">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
        <p className="text-gray-600 mb-6">Your course has been updated successfully.</p>
        <button
          onClick={onConfirm}
          className="w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );


const emptyCourseState = {
    courseTitle: '', courseCategory: '', courseLevel: '', language: '', maxStudents: '',
    publicPrivate: 'public', shortDescription: '', courseDescription: [{ type: 'paragraph', children: [{ text: '' }] }], learningOutcomes: [],
    requirements: [], featuredCourse: false, courseThumbnail: null, courseVideoType: 'external',
    courseVideoUrl: '', sections: [], faqs: [], tags: [], messageToReviewer: '',
    copyrightAgreement: false, isFree: false, coursePrice: '', hasDiscount: false,
    discountPrice: '', expiryPeriod: 'lifetime', numberOfMonths: '', isPublished: false
};


const EditCourse = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
     

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [newTag, setNewTag] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null); // <-- ADDED THIS

    useEffect(() => {
        if (!courseId) return;
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const courseDocRef = doc(db, 'courses', courseId);
                const docSnap = await getDoc(courseDocRef);
// Replace the block above with this one
if (docSnap.exists()) {
    const fetchedData = docSnap.data();

    // --- Start of New Conversion Logic ---
    
    // Check if the main description is old plain text
    if (typeof fetchedData.courseDescription === 'string') {
        // If it is, convert it to Slate's format
        fetchedData.courseDescription = [{ type: 'paragraph', children: [{ text: fetchedData.courseDescription || '' }] }];
    }

    // Also check the content for each individual lesson
    if (fetchedData.sections) {
        fetchedData.sections.forEach(section => {
            if (section.lessons) {
                section.lessons.forEach(lesson => {
                    if (typeof lesson.content === 'string') {
                        lesson.content = [{ type: 'paragraph', children: [{ text: lesson.content || '' }] }];
                    }
                });
            }
        });
    }
    // --- End of New Conversion Logic ---

    setFormData({ ...emptyCourseState, ...fetchedData });

} else {
    setError('No such course found!');
}
            } catch (err) {
                console.error("Error fetching document:", err);
                setError('Failed to fetch course data.');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ADDED: Handler for Lexical Editors
    const handleEditorChange = (content, field) => {
        setFormData(prev => ({ ...prev, [field]: content }));
    };

    // ADDED: Handler specifically for lesson content
    const updateLessonContent = (sectionId, lessonId, content) => {
        setFormData(prev => ({
            ...prev,
            sections: prev.sections.map(section =>
                section.id === sectionId ? {
                    ...section,
                    lessons: section.lessons.map(lesson =>
                        lesson.id === lessonId ? { ...lesson, content } : lesson
                    )
                } : section
            )
        }));
    };
    // Add this function with your other lesson handlers
const updateLessonDuration = (sectionId, lessonId, duration) => {
    // Convert the input text to a number. If it's not a valid number, default to 0.
    const durationInMinutes = parseInt(duration, 10) || 0;

    setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
            section.id === sectionId
                ? {
                    ...section,
                    lessons: section.lessons.map(lesson =>
                        lesson.id === lessonId 
                            ? { ...lesson, duration: durationInMinutes } // Update the duration field
                            : lesson
                    )
                  }
                : section
        )
    }));
};
    
    const addLearningOutcome = () => { setFormData(prev => ({ ...prev, learningOutcomes: [...(prev.learningOutcomes || []), ''] })); };
    const updateLearningOutcome = (index, value) => { setFormData(prev => ({ ...prev, learningOutcomes: prev.learningOutcomes.map((item, i) => i === index ? value : item) })); };
    const deleteLearningOutcome = (index) => { setFormData(prev => ({ ...prev, learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index) })); };

    const addRequirement = () => { setFormData(prev => ({ ...prev, requirements: [...(prev.requirements || []), ''] })); };
    const updateRequirement = (index, value) => { setFormData(prev => ({ ...prev, requirements: prev.requirements.map((item, i) => i === index ? value : item) })); };
    const deleteRequirement = (index) => { setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) })); };
    
    const addSection = () => {
        const newSection = { id: Date.now(), title: '', expanded: true, lessons: [] };
        setFormData(prev => ({ ...prev, sections: [...(prev.sections || []), newSection] }));
    };
    const updateSectionTitle = (sectionId, title) => { setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, title } : s) })); };
    const deleteSection = (sectionId) => { setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) })); };
    const toggleSection = (sectionId) => { setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, expanded: !s.expanded } : s) })); };
    
    const addLesson = (sectionId) => {
        const newLesson = { 
            id: Date.now(), 
            title: '', 
            completed: false,
            content: [{ type: 'paragraph', children: [{ text: '' }] }],
            videoUrl: '',
            videoType: 'external',
            duration: 0 
        };
        setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s)}));
    };
    const updateLessonTitle = (sectionId, lessonId, title) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.map(l => l.id === lessonId ? { ...l, title } : l) } : s) }));
    };
    const deleteLesson = (sectionId, lessonId) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s)}));
    };

    const addFAQ = () => {
        const newFAQ = { id: Date.now(), question: '', answer: '' };
        setFormData(prev => ({ ...prev, faqs: [...(prev.faqs || []), newFAQ] }));
    };
    const updateFAQ = (faqId, field, value) => { setFormData(prev => ({ ...prev, faqs: prev.faqs.map(f => f.id === faqId ? { ...f, [field]: value } : f) })); };
    const deleteFAQ = (faqId) => { setFormData(prev => ({ ...prev, faqs: prev.faqs.filter(f => f.id !== faqId) })); };
    
    const addTag = () => {
        if (newTag.trim() && formData.tags.length < 14) {
            const tag = newTag.trim().toLowerCase();
            if (!formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
            }
            setNewTag('');
        }
    };
    const removeTag = (tagToRemove) => { setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) })); };
    
    const handleUpdateCourse = async () => {
        if (!formData) return;
        setIsUpdating(true);
        setError(null);
        try {
            const courseDocRef = doc(db, 'courses', courseId);
            await updateDoc(courseDocRef, {
                ...formData,
                updatedAt: serverTimestamp(),
            });
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Error updating document:", err);
            setError('Failed to update course: ' + err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        } else {
            handleUpdateCourse();
        }
    };
    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Add this block of functions back into your EditCourse component

const updateLessonVideoType = (sectionId, lessonId, videoType) => {
  setFormData(prev => ({
    ...prev,
    sections: prev.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, videoType } : lesson
            )
          }
        : section
    )
  }));
};

const updateLessonVideoUrl = (sectionId, lessonId, videoUrl) => {
  // You can add your validation logic back here if you wish
  setFormData(prev => ({
    ...prev,
    sections: prev.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, videoUrl } : lesson
            )
          }
        : section
    )
  }));
};

const handleLessonVideoUpload = async (sectionId, lessonId, e) => {
  const file = e.target.files[0];
  if (file) {
    // This assumes your handleFileUpload function exists elsewhere in the file
    const url = await handleFileUpload(file, 'video');
    if (url) {
      // Re-use the update function to set the URL
      updateLessonVideoUrl(sectionId, lessonId, url);
    }
  }
};

    const renderBasicInformation = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input type="text" value={formData.courseTitle} onChange={(e) => handleInputChange('courseTitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter course title"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Category *</label>
                    <select value={formData.courseCategory} onChange={(e) => handleInputChange('courseCategory', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select</option><option value="web-development">Web Development</option><option value="data-science">Data Science</option><option value="mobile-development">Mobile Development</option><option value="design">Design</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Level *</label>
                    <select value={formData.courseLevel} onChange={(e) => handleInputChange('courseLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language *</label>
                    <select value={formData.language} onChange={(e) => handleInputChange('language', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select</option><option value="english">English</option><option value="spanish">Spanish</option><option value="french">French</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Description *</label>
                <SlateEditor
        value={formData.courseDescription}
        onChange={(newValue) => handleInputChange('courseDescription', newValue)}
    />
            </div>
        </div>
    );

    const renderCourseMedia = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Course Media</h2>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail</label>
                {formData.courseThumbnail && <img src={formData.courseThumbnail} alt="Thumbnail preview" className="w-48 h-auto rounded-md mb-2"/>}
                <p className="text-xs text-gray-500 mb-2">Current: {formData.courseThumbnail || 'None'}</p>
                <input type="file" accept="image/*" onChange={(e) => console.log("File selected for thumbnail")} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
        </div>
    );

    // Replace your entire renderCurriculum function with this one

const renderCurriculum = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Curriculum</h2>
            <button
                onClick={addSection}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
                <Plus className="w-4 h-4 mr-1"/> Add New Section
            </button>
        </div>

        <div className="space-y-4">
            {formData.sections && formData.sections.map((section) => (
                <div key={section.id} className="border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4 bg-gray-50">
                        <div className="flex items-center space-x-3 flex-1">
                            <button onClick={() => toggleSection(section.id)} className="text-gray-500 hover:text-gray-700">
                                <FolderOpen className="w-5 h-5"/>
                            </button>
                            <input 
                                type="text" 
                                value={section.title} 
                                onChange={(e) => updateSectionTitle(section.id, e.target.value)} 
                                className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full" 
                                placeholder="Enter section title"
                            />
                        </div>
                        <button onClick={() => deleteSection(section.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>

                    {section.expanded && (
                        <div className="p-4 space-y-3">
                            {section.lessons.map((lesson) => (
                                <div key={lesson.id} className="bg-white border border-gray-200 rounded-md">
                                    <div className="flex items-center justify-between p-3">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <CirclePlay className="w-5 h-5 text-gray-400"/>
                                            <input 
                                                type="text" 
                                                value={lesson.title} 
                                                onChange={(e) => updateLessonTitle(section.id, lesson.id, e.target.value)} 
                                                className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 w-full" 
                                                placeholder="Enter lesson title"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button 
                                                type="button" 
                                                onClick={() => setEditingLessonId(editingLessonId === lesson.id ? null : lesson.id)} 
                                                className="text-blue-600 hover:text-blue-800" title="Edit Lesson Details"
                                            >
                                                <Pencil className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => deleteLesson(section.id, lesson.id)} 
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* This block only appears when you click the Pencil icon */}
                                    {editingLessonId === lesson.id && (
                                        <div className="p-3 border-t border-gray-200 space-y-4">
                                            
                                            {/* Video Inputs */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Video</label>
                                                <div className="flex items-center space-x-4 mb-2">
                                                    <select
                                                        value={lesson.videoType}
                                                        onChange={(e) => updateLessonVideoType(section.id, lesson.id, e.target.value)}
                                                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    >
                                                        <option value="external">External URL</option>
                                                        <option value="upload">Upload Video</option>
                                                    </select>
                                                </div>
                                                {lesson.videoType === 'external' ? (
                                                    <input
                                                        type="text"
                                                        value={lesson.videoUrl}
                                                        onChange={(e) => updateLessonVideoUrl(section.id, lesson.id, e.target.value)}
                                                        placeholder="YouTube, Vimeo, or direct video URL"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                ) : (
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={(e) => handleLessonVideoUpload(section.id, lesson.id, e)}
                                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                )}
                                            </div>
                                <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lesson Duration (in minutes)
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="e.g., 7"
                                                value={lesson.duration || ''} // Display the current duration
                                                onChange={(e) => updateLessonDuration(section.id, lesson.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                     </div>

                                            {/* Slate Editor for Lesson Content */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Content</label>
                                                <SlateEditor
                                                    key={lesson.id}
                                                    value={lesson.content}
                                                    onChange={(newValue) => updateLessonContent(section.id, lesson.id, newValue)}
                                                    placeholder="Write the lesson content here..."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button onClick={() => addLesson(section.id)} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">+ Add Lesson</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

    const renderAdditionalInformation = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Additional Information</h2>
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">FAQ's</h3>
                    <button onClick={addFAQ} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"><Plus /> Add New</button>
                </div>
                <div className="space-y-3">
                    {formData.faqs && formData.faqs.map((faq) => (
                        <div key={faq.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <input type="text" value={faq.question} onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)} className="text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 w-full" placeholder="Enter FAQ question"/>
                                <button onClick={() => deleteFAQ(faq.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                            </div>
                            <textarea value={faq.answer} onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter FAQ answer"/>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags && formData.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                        </span>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTag()} placeholder="Add tags..." className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    <button onClick={addTag} className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">Add</button>
                </div>
            </div>
        </div>
    );

    const renderPricing = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
            <div className="flex items-center space-x-3">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isFree} onChange={(e) => handleInputChange('isFree', e.target.checked)} className="sr-only peer"/>
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-gray-700">Check if this is a free course</span>
            </div>
            {!formData.isFree && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Course Price ($)</label>
                        <input type="number" value={formData.coursePrice} onChange={(e) => handleInputChange('coursePrice', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter course price"/>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input type="checkbox" id="hasDiscount" checked={formData.hasDiscount} onChange={(e) => handleInputChange('hasDiscount', e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                        <label htmlFor="hasDiscount" className="text-sm text-gray-700">Check if this course has a discount</label>
                    </div>
                    {formData.hasDiscount && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price ($)</label>
                            <input type="number" value={formData.discountPrice} onChange={(e) => handleInputChange('discountPrice', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter discount price"/>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return renderBasicInformation();
            case 2: return renderCourseMedia();
            case 3: return renderCurriculum();
            case 4: return renderAdditionalInformation();
            case 5: return renderPricing();
            default: return renderBasicInformation();
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen"><p className="text-lg font-semibold">Loading Course Editor...</p></div>;
    if (error) return <div className="max-w-4xl mx-auto p-6"><div className="p-4 text-red-700 bg-red-100 rounded-md">{error}</div></div>;
    if (!formData) return <div className="max-w-4xl mx-auto p-6"><div className="p-4 text-yellow-700 bg-yellow-100 rounded-md">Could not load course data.</div></div>;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h1 className="text-2xl font-bold mb-2">Edit Course</h1>
                    <p className="text-gray-500 mb-6 truncate">Editing: {formData.courseTitle}</p>
                    {error && <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                    <div className="mt-8">
                        {renderCurrentStep()}
                    </div>
                    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                        <button onClick={handlePrevious} disabled={currentStep === 1} className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:bg-white disabled:cursor-not-allowed">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                        </button>
                        <button onClick={handleNext} disabled={isUpdating} className="flex items-center px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300">
                            {currentStep === 5 ? (isUpdating ? 'Saving...' : 'Save Changes') : 'Next'}
                            {currentStep < 5 && <ChevronRight className="w-4 h-4 ml-1" />}
                        </button>
                    </div>
                </div>
            </div>
            {showSuccessModal && (
                <SuccessModal 
                    onConfirm={() => navigate('/admin/dashboard')} 
                />
            )}
        </div>
    );
};

export default EditCourse;