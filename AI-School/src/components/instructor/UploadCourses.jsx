import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SlateEditor from '../admin/SlateEditor'; // Assuming you have this component
import { ChevronLeft, ChevronRight, Plus, Trash2, FolderOpen, CirclePlay } from 'lucide-react';

const InstructorCourseForm = () => {
    const navigate = useNavigate();
    const initialSlateValue = [{ type: 'paragraph', children: [{ text: '' }] }];

    const [currentStep, setCurrentStep] = useState(1);
    
    // --- UPDATED: This function now checks for a saved draft in localStorage on initial load ---
    const [formData, setFormData] = useState(() => {
        const savedDraft = localStorage.getItem('instructorCourseDraft');
        try {
            if (savedDraft) {
                // If a draft exists, parse it and use it as the initial state
                return JSON.parse(savedDraft);
            }
        } catch (e) {
            console.error("Could not parse saved draft:", e);
        }
        // If no draft exists, or if parsing fails, return the default empty form state
        return {
            courseTitle: '',
            contentType: 'course',
            courseCategory: '',
            courseLevel: 'Beginner',
            shortDescription: '',
            courseDescription: initialSlateValue,
            courseThumbnail: null,
            courseVideoUrl: '',
            courseVideoType: 'external',
            tags: [],
            sections: [],
            isPublished: false,
            isFree: false,
            coursePrice: '',
            hasDiscount: false,
            discountPrice: '',
            learningOutcomes: [],
            requirements: [],
        };
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTag, setNewTag] = useState('');

    // --- NEW: This useEffect saves the form data to localStorage whenever it changes ---
    useEffect(() => {
        if (formData) {
            localStorage.setItem('instructorCourseDraft', JSON.stringify(formData));
        }
    }, [formData]);


    // --- Handlers for form inputs ---
    const handleInputChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        if (field === 'contentType' && (value === 'guide' || value === 'workshop')) {
            newFormData.isFree = true;
            newFormData.coursePrice = '';
            newFormData.hasDiscount = false;
            newFormData.discountPrice = '';
        }
        if (field === 'isFree' && value === true) {
            newFormData.coursePrice = '';
            newFormData.hasDiscount = false;
            newFormData.discountPrice = '';
        }
        setFormData(newFormData);
    };

    // --- Handlers for Curriculum ---
    const addSection = () => {
        const newSection = { id: Date.now(), title: `New Section ${formData.sections.length + 1}`, lessons: [] };
        setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    };
    const updateSectionTitle = (sectionId, title) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, title } : s) }));
    };
    const deleteSection = (sectionId) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sectionId) }));
    };
    const addLesson = (sectionId) => {
        const newLesson = { id: Date.now(), title: 'New Lesson', content: initialSlateValue, videoUrl: '' };
        setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s)}));
    };
    const updateLessonField = (sectionId, lessonId, field, value) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.map(section => section.id === sectionId ? { ...section, lessons: section.lessons.map(lesson => lesson.id === lessonId ? { ...lesson, [field]: value } : lesson) } : section)}));
    };
    const deleteLesson = (sectionId, lessonId) => {
        setFormData(prev => ({ ...prev, sections: prev.sections.map(s => s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s)}));
    };

    // --- Handlers for Learning Outcomes and Requirements ---
    const addLearningOutcome = () => {
        setFormData(prev => ({ ...prev, learningOutcomes: [...prev.learningOutcomes, ''] }));
    };
    const updateLearningOutcome = (index, value) => {
        setFormData(prev => ({ ...prev, learningOutcomes: prev.learningOutcomes.map((item, i) => i === index ? value : item) }));
    };
    const deleteLearningOutcome = (index) => {
        setFormData(prev => ({ ...prev, learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index) }));
    };
    const addRequirement = () => {
        setFormData(prev => ({ ...prev, requirements: [...prev.requirements, ''] }));
    };
    const updateRequirement = (index, value) => {
        setFormData(prev => ({ ...prev, requirements: prev.requirements.map((item, i) => i === index ? value : item) }));
    };
    const deleteRequirement = (index) => {
        setFormData(prev => ({ ...prev, requirements: prev.requirements.filter((_, i) => i !== index) }));
    };

    // --- Cloudinary and Tag handlers ---
    const handleFileUpload = async (file, type = 'image') => {
        if (!file) return null;
        const cloudFormData = new FormData();
        cloudFormData.append('file', file);
        cloudFormData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${type}/upload`, {
                method: 'POST',
                body: cloudFormData
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.secure_url;
        } catch (err) {
            setError('File upload failed. Please try again.');
            return null;
        }
    };

    const handleThumbnailChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await handleFileUpload(file, 'image');
            if (url) {
                setFormData(prev => ({ ...prev, courseThumbnail: url }));
            }
        }
    };

    // --- Video Handlers ---
    const validateVideoUrl = (url) => {
      if (!url) return false;
      const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
      const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
      const directVideoRegex = /\.(mp4|webm|ogg)$/i;
      return youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url);
    };
    const getEmbedUrl = (url) => {
      if (!url) return null;
      const youtubeMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      const vimeoMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      if (url.match(/\.(mp4|webm|ogg)$/i)) return url;
      return null;
    };
    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await handleFileUpload(file, 'video');
            if (url) {
                setFormData(prev => ({ ...prev, courseVideoUrl: url }));
            }
        }
    };
    const handleVideoUrlChange = (e) => {
        const url = e.target.value;
        if (formData.courseVideoType === 'external' && url && !validateVideoUrl(url)) {
            setError('Invalid video URL. Use YouTube, Vimeo, or direct video links.');
        } else {
            setError(null);
        }
        handleInputChange('courseVideoUrl', url);
    };

    const addTag = () => {
        if (newTag.trim() && formData.tags.length < 14) {
            const tag = newTag.trim().toLowerCase();
            if (!formData.tags.includes(tag)) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            }
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    // --- Form Submission Handler ---
    const handleCreateContent = async () => {
        setIsSubmitting(true);
        setError(null);
        if (!formData.courseTitle || !formData.courseThumbnail) {
            setError(`Please provide a Title and a Thumbnail.`);
            setIsSubmitting(false);
            return;
        }
        try {
            const contentData = {
                ...formData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: auth.currentUser?.uid,
                status: formData.isPublished ? 'published' : 'pending',
            };
            await addDoc(collection(db, 'courses'), contentData);
            
            // --- UPDATED: Clear the draft from localStorage on successful submission ---
            localStorage.removeItem('instructorCourseDraft');

            navigate('/instructor/dashboard');
        } catch (err) {
            console.error("Error creating content:", err);
            setError('Failed to submit content: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Stepper Logic ---
    const allSteps = [
        { number: 1, title: 'Information', types: ['course', 'guide', 'workshop'] },
        { number: 2, title: 'Content', types: ['course', 'guide', 'workshop'] },
        { number: 3, title: 'Pricing & Publish', types: ['course', 'workshop'] }
    ];
    const steps = allSteps.filter(step => step.types.includes(formData.contentType));
    const totalSteps = steps.length;
    const handleNext = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
        else handleCreateContent();
    };
    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // --- Render Functions for Steps ---
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === index + 1 ? 'bg-purple-600 text-white' : currentStep > index + 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {currentStep > index + 1 ? '✓' : index + 1}
                        </div>
                        <span className="text-xs mt-1 text-gray-600">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-16 h-0.5 mx-2 mt-[-16px] ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderBasicInfo = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                <select value={formData.contentType} onChange={(e) => handleInputChange('contentType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="course">Course</option>
                    <option value="guide">Guide</option>
                    <option value="workshop">Workshop</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input type="text" value={formData.courseTitle} onChange={(e) => handleInputChange('courseTitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter title" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select value={formData.courseCategory} onChange={(e) => handleInputChange('courseCategory', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">Select Category</option>
                        <option value="Data Analysis">Data Analysis</option>
                        <option value="Business Operations">Business Operations</option>
                        <option value="Coding">Coding</option>
                        <option value="Project Management">Project Management</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level *</label>
                    <select value={formData.courseLevel} onChange={(e) => handleInputChange('courseLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                <textarea value={formData.shortDescription} onChange={(e) => handleInputChange('shortDescription', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter a brief summary" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Main Description</label>
                <SlateEditor value={formData.courseDescription} onChange={(newContent) => handleInputChange('courseDescription', newContent)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What will students learn?</label>
                    {formData.learningOutcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input type="text" value={outcome} onChange={(e) => updateLearningOutcome(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., How to build a web app" />
                            <button onClick={() => deleteLearningOutcome(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    ))}
                    <button onClick={addLearningOutcome} className="text-sm text-blue-600 hover:underline">+ Add New Item</button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                    {formData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                            <input type="text" value={req} onChange={(e) => updateRequirement(index, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., Basic HTML knowledge" />
                            <button onClick={() => deleteRequirement(index)} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                        </div>
                    ))}
                    <button onClick={addRequirement} className="text-sm text-blue-600 hover:underline">+ Add New Item</button>
                </div>
            </div>
            <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">Thumbnail *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {formData.courseThumbnail && (<img src={formData.courseThumbnail} alt="Thumbnail preview" className="w-48 h-auto mx-auto rounded-md mb-4"/>)}
                    <div className="text-gray-500">{formData.courseThumbnail ? 'Image Uploaded' : 'No File Selected'}</div>
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" id="thumbnail-upload" />
                    <label htmlFor="thumbnail-upload" className="bg-blue-600 text-white px-4 py-2 mt-2 inline-block rounded-md hover:bg-blue-700 cursor-pointer">Upload File</label>
                </div>
            </div>
            <div className="pt-6 border-t">
                <label className="block text-lg font-semibold text-gray-900 mb-4">Overview Video (Optional)</label>
                 <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                    <select value={formData.courseVideoType} onChange={(e) => handleInputChange('courseVideoType', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
                        <option value="external">External URL</option>
                        <option value="upload">Upload Video</option>
                    </select>
                    {formData.courseVideoType === 'external' ? (
                        <input type="text" value={formData.courseVideoUrl} onChange={handleVideoUrlChange} placeholder="YouTube, Vimeo, or direct video URL" className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
                    ) : (
                        <input type="file" accept="video/*" onChange={handleVideoUpload} className="flex-1 px-3 py-2 border border-gray-300 rounded-md" />
                    )}
                </div>
                {formData.courseVideoUrl && (
                     <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                        <iframe src={getEmbedUrl(formData.courseVideoUrl)} className="w-full h-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title="Overview Video Preview" />
                    </div>
                )}
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Content & Lessons</h2>
                <button onClick={addSection} className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"><Plus size={16} className="mr-1"/> Add Section</button>
            </div>
            <div className="space-y-4">
                {formData.sections.map((section) => (
                    <div key={section.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <input type="text" value={section.title} onChange={(e) => updateSectionTitle(section.id, e.target.value)} className="text-lg font-medium text-gray-800 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none w-full" placeholder="Enter section title"/>
                            <button onClick={() => deleteSection(section.id)} className="text-red-500 hover:text-red-700 ml-4"><Trash2 className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                            {section.lessons.map((lesson) => (
                                <div key={lesson.id} className="p-4 bg-white border rounded-md space-y-3">
                                    <div className="flex items-center justify-between">
                                        <input type="text" value={lesson.title} onChange={(e) => updateLessonField(section.id, lesson.id, 'title', e.target.value)} className="font-semibold text-gray-700 bg-transparent border-none focus:outline-none w-full" placeholder="Enter lesson title"/>
                                        <button onClick={() => deleteLesson(section.id, lesson.id)} className="text-red-500 hover:text-red-700 ml-2"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Lesson Video (Optional)</label>
                                        <input type="text" value={lesson.videoUrl} onChange={(e) => updateLessonField(section.id, lesson.id, 'videoUrl', e.target.value)} placeholder="YouTube, Vimeo, or direct video URL" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Lesson Content</label>
                                        <SlateEditor
                                            value={lesson.content}
                                            onChange={(newContent) => updateLessonField(section.id, lesson.id, 'content', newContent)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => addLesson(section.id)} className="text-sm text-blue-600 hover:underline">+ Add Lesson</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPublish = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Pricing & Publish Settings</h2>
            <div className="space-y-4 pt-4 border-t">
                 <div className="flex items-center space-x-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isFree" checked={formData.isFree} onChange={(e) => handleInputChange('isFree', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                    <span className="text-sm text-gray-700">This is free content</span>
                </div>
                {!formData.isFree && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                            <input type="number" name="coursePrice" value={formData.coursePrice} onChange={(e) => handleInputChange('coursePrice', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter price" />
                        </div>
                        <div className="flex items-center space-x-3">
                            <input type="checkbox" name="hasDiscount" checked={formData.hasDiscount} onChange={(e) => handleInputChange('hasDiscount', e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">Enable discount</span>
                        </div>
                        {formData.hasDiscount && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price ($)</label>
                                <input type="number" name="discountPrice" value={formData.discountPrice} onChange={(e) => handleInputChange('discountPrice', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter discount price" />
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{tag}<button onClick={() => removeTag(tag)} className="ml-2 text-gray-500 hover:text-gray-700">×</button></span>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTag()} placeholder="Add tags..." className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
                    <button onClick={addTag} className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">Add</button>
                </div>
            </div>
            <div className="flex items-center space-x-3 pt-4 border-t">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={formData.isPublished} onChange={(e) => handleInputChange('isPublished', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className="text-sm text-gray-700">Publish immediately</span>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1: return renderBasicInfo();
            case 2: return renderContent();
            case 3: return renderPublish();
            default: return renderBasicInfo();
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 overflow-x-hidden"> 
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 md:p-8 mt-[65px] lg:mt-0 overflow-hidden mb-[65px] lg:mb-0"> 
        {renderStepIndicator()}
        {error && <div className="text-center p-4 text-red-600 bg-red-50 rounded-lg mb-6">{error}</div>}
        <div className="mt-8">
            {renderCurrentStep()}
        </div>
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button onClick={handlePrevious} disabled={currentStep === 1} className="flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            <button onClick={handleNext} disabled={isSubmitting} className="flex items-center px-6 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 disabled:bg-gray-400">
                {isSubmitting ? 'Submitting...' : (currentStep === totalSteps ? 'Submit Content' : 'Next')}
                {currentStep < totalSteps && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
        </div>
    </div>
</div>
    );
};

export default InstructorCourseForm;
