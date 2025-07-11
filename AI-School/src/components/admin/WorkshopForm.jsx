import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SlateEditor from './SlateEditor';
import { Trash2, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const WorkshopForm = () => {
    const navigate = useNavigate();
    const initialSlateValue = [{ type: 'paragraph', children: [{ text: '' }] }];

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        workshopTitle: '',
        workshopCategory: '',
        workshopLevel: 'Beginner',
        shortDescription: '',
        workshopThumbnail: null,
        tags: [],
        lessons: [], // This will hold the sessions/lessons of the workshop
        isPublished: false,
        contentType: 'workshop', // This is always 'workshop'
        isFree: false,
        coursePrice: '',
        hasDiscount: false,
        discountPrice: '',
    });

    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTag, setNewTag] = useState('');

    // --- Handlers for form inputs ---
    const handleInputChange = (field, value) => {
        const newFormData = { ...formData, [field]: value };
        if (field === 'isFree' && value === true) {
            newFormData.coursePrice = '';
            newFormData.hasDiscount = false;
            newFormData.discountPrice = '';
        }
        setFormData(newFormData);
    };

    // --- Handlers for Lessons/Sessions ---
    const addLesson = () => {
        const newLesson = { 
            id: Date.now(), 
            title: 'New Session Title', 
            content: initialSlateValue,
            videoUrl: '',
        };
        setFormData(prev => ({ ...prev, lessons: [...prev.lessons, newLesson] }));
    };

    const updateLessonField = (lessonId, field, value) => {
        setFormData(prev => ({
            ...prev,
            lessons: prev.lessons.map(lesson => 
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            )
        }));
    };

    const deleteLesson = (lessonId) => {
        setFormData(prev => ({ 
            ...prev, 
            lessons: prev.lessons.filter(l => l.id !== lessonId) 
        }));
    };

    // --- Cloudinary and Tag handlers ---
    const handleFileUpload = async (file) => {
        if (!file) return null;
        const cloudFormData = new FormData();
        cloudFormData.append('file', file);
        cloudFormData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: cloudFormData
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.secure_url;
        } catch (err) {
            setError('Image upload failed. Please try again.');
            return null;
        }
    };

    const handleThumbnailChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = await handleFileUpload(file);
            if (url) {
                setFormData(prev => ({ ...prev, workshopThumbnail: url }));
            }
        }
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
    const handleCreateWorkshop = async () => {
        setIsSubmitting(true);
        setError(null);
        
        if (!formData.workshopTitle || !formData.workshopThumbnail) {
            setError("Please provide a Title and a Thumbnail for the workshop.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Map the form data to match the 'courses' collection structure
            const workshopData = {
                courseTitle: formData.workshopTitle,
                courseCategory: formData.workshopCategory,
                courseLevel: formData.workshopLevel,
                shortDescription: formData.shortDescription,
                courseThumbnail: formData.workshopThumbnail,
                tags: formData.tags,
                sections: [{ id: Date.now(), title: 'Workshop Content', lessons: formData.lessons }],
                isPublished: formData.isPublished,
                contentType: 'workshop',
                isFree: formData.isFree,
                coursePrice: formData.coursePrice || 0,
                hasDiscount: formData.hasDiscount,
                discountPrice: formData.discountPrice || 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: auth.currentUser?.uid || 'anonymous',
                status: formData.isPublished ? 'published' : 'pending',
            };
            await addDoc(collection(db, 'courses'), workshopData);
            navigate('/admin/success');
        } catch (err) {
            console.error("Error creating workshop:", err);
            setError('Failed to submit workshop: ' + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Stepper Logic ---
    const steps = [
        { number: 1, title: 'Workshop Information' },
        { number: 2, title: 'Workshop Content' },
        { number: 3, title: 'Pricing & Publish' },
    ];
    const totalSteps = steps.length;

    const handleNext = () => {
        if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
        else handleCreateWorkshop();
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    // --- Render Functions for Steps ---
    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === index + 1 ? 'bg-blue-600 text-white' : currentStep > index + 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {currentStep > index + 1 ? '✓' : index + 1}
                        </div>
                        <span className="text-xs mt-1 text-gray-600">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`w-24 h-0.5 mx-2 mt-[-16px] ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderBasicInfo = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workshop Title *</label>
                <input type="text" value={formData.workshopTitle} onChange={(e) => handleInputChange('workshopTitle', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter workshop title" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select value={formData.workshopCategory} onChange={(e) => handleInputChange('workshopCategory', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="">Select Category</option>
                        <option value="Live Session">Live Session</option>
                        <option value="Pre-Recorded">Pre-Recorded</option>
                        <option value="Interactive">Interactive</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level *</label>
                    <select value={formData.workshopLevel} onChange={(e) => handleInputChange('workshopLevel', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                <textarea value={formData.shortDescription} onChange={(e) => handleInputChange('shortDescription', e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Enter a brief summary of the workshop" />
            </div>
            <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">Workshop Thumbnail *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {formData.workshopThumbnail && (<img src={formData.workshopThumbnail} alt="Thumbnail preview" className="w-48 h-auto mx-auto rounded-md mb-4"/>)}
                    <div className="text-gray-500">{formData.workshopThumbnail ? 'Image Uploaded' : 'No File Selected'}</div>
                    <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" id="thumbnail-upload" />
                    <label htmlFor="thumbnail-upload" className="bg-blue-600 text-white px-4 py-2 mt-2 inline-block rounded-md hover:bg-blue-700 cursor-pointer">Upload File</label>
                </div>
            </div>
        </div>
    );

    const renderContent = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Workshop Sessions / Lessons</h2>
                <button onClick={addLesson} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"><Plus size={16} className="mr-1"/> Add Session</button>
            </div>
            <div className="space-y-4">
                {formData.lessons.map((lesson) => (
                    <div key={lesson.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <input type="text" value={lesson.title} onChange={(e) => updateLessonField(lesson.id, 'title', e.target.value)} className="text-lg font-medium text-gray-800 bg-transparent border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none w-full" placeholder="Enter session title"/>
                            <button onClick={() => deleteLesson(lesson.id)} className="text-red-500 hover:text-red-700 ml-4"><Trash2 className="w-5 h-5" /></button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Session Video URL (Optional)</label>
                            <input type="text" value={lesson.videoUrl} onChange={(e) => updateLessonField(lesson.id, 'videoUrl', e.target.value)} placeholder="YouTube, Vimeo, or direct video URL" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"/>
                        </div>
                        <SlateEditor
                            value={lesson.content}
                            onChange={(newContent) => updateLessonField(lesson.id, 'content', newContent)}
                        />
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
                    <span className="text-sm text-gray-700">This is a free workshop</span>
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
                <span className="text-sm text-gray-700">Publish this workshop immediately</span>
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
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
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
                        {isSubmitting ? 'Submitting...' : (currentStep === totalSteps ? 'Submit Workshop' : 'Next')}
                        {currentStep < totalSteps && <ChevronRight className="w-4 h-4 ml-1" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WorkshopForm;
