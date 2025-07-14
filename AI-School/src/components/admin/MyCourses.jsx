import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2, FolderOpen, Plus, CirclePlay } from 'lucide-react';
import { auth, db } from '../../lib/firebaseConfig'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
// import LexicalEditor from './LexicalEditor'; 
import SlateEditor from './SlateEditor';

const MyCourses = () => {
  const [currentStep, setCurrentStep] = useState(1);
 // Define the initial empty state for a Slate editor outside the component
  const initialSlateValue = [{ type: 'paragraph', children: [{ text: '' }] }];

  // This new useState function checks for a saved draft when the component loads
  const [formData, setFormData] = useState(() => {
    const savedDraft = localStorage.getItem('courseDraft');
    try {
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (e) {
      console.error("Could not parse saved draft:", e);
    }
    // If no draft exists, start with a fresh form
    return {
      courseTitle: '',
      courseCategory: '',
      courseLevel: '',
      language: '',
      maxStudents: '',
      publicPrivate: 'public',
      shortDescription: '',
      courseDescription: initialSlateValue, // Use the correct initial value
      learningOutcomes: [],
      requirements: [],
      featuredCourse: false,
      courseThumbnail: null,
      courseVideoType: 'external',
      courseVideoUrl: '',
      sections: [],
      faqs: [],
      tags: [],
      messageToReviewer: '',
      copyrightAgreement: false,
      isFree: false,
      coursePrice: '',
      hasDiscount: false,
      discountPrice: '',
      expiryPeriod: 'lifetime',
      numberOfMonths: '',
      isPublished: false
    };
  });
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState(''); 
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
useEffect(() => {
    if (formData) {
      localStorage.setItem('courseDraft', JSON.stringify(formData));
    }
  }, [formData]);

  // Update lesson video type
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

// Update lesson video URL
const updateLessonVideoUrl = (sectionId, lessonId, videoUrl) => {
  if (videoUrl && !validateVideoUrl(videoUrl)) {
    setError('Invalid video URL for lesson. Use YouTube, Vimeo, or direct video links (.mp4, .webm, .ogg).');
  } else {
    setError(null);
  }
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

// Handle lesson video upload
const handleLessonVideoUpload = async (sectionId, lessonId, e) => {
  const file = e.target.files[0];
  if (file) {
    const url = await handleFileUpload(file, 'video');
    if (url) {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.map(section =>
          section.id === sectionId
            ? {
                ...section,
                lessons: section.lessons.map(lesson =>
                  lesson.id === lessonId ? { ...lesson, videoUrl: url } : lesson
                )
              }
            : section
        )
      }));
    }
  }
};



  // Validate external video URL
  const validateVideoUrl = (url) => {
    if (!url) return false;
    // YouTube: Matches youtube.com/watch?v=... or youtu.be/...
    const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    // Vimeo: Matches vimeo.com/...
    const vimeoRegex = /^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    // Direct video: Matches .mp4, .webm, .ogg, etc.
    const directVideoRegex = /\.(mp4|webm|ogg)$/i;

    return youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url);
  };

  // Convert YouTube/Vimeo URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    // YouTube
    const youtubeMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    // Direct video (e.g., Cloudinary)
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }
    return null;
  };

  // Handle file upload to Cloudinary (for images and videos)
  const handleFileUpload = async (file, type) => {
    if (!file) {
      setError('No file selected');
      return null;
    }

    // Validate file type for images
    if (type === 'image' && !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Invalid image format. Use JPEG, PNG, GIF, or WebP.');
      return null;
    }

    // Validate file size for images (2MB limit as per UI)
    if (type === 'image' && file.size > 2 * 1024 * 1024) {
      setError('Image file size exceeds 2MB limit.');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${type === 'image' ? 'image' : 'video'}/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error.message);
        return null;
      }
      return data.secure_url;
    } catch (error) {
      setError('File upload failed: ' + error.message);
      return null;
    }
  };

  // Handle thumbnail upload (image only)
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handleFileUpload(file, 'image');
      if (url) {
        setFormData(prev => ({ ...prev, courseThumbnail: url }));
      }
    }

  };

  // Handle video upload (if upload option is selected)
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await handleFileUpload(file, 'video');
      if (url) {
        setFormData(prev => ({ ...prev, courseVideoUrl: url }));
      }
    }
  };

  // Handle external video URL input
  const handleVideoUrlChange = (e) => {
    const url = e.target.value;
    if (formData.courseVideoType === 'external' && url && !validateVideoUrl(url)) {
      setError('Invalid video URL. Use YouTube, Vimeo, or direct video links (.mp4, .webm, .ogg).');
    } else {
      setError(null);
    }
    handleInputChange('courseVideoUrl', url);
  };

  // Add learning outcome
  const addLearningOutcome = () => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, '']
    }));
  };

  // Update learning outcome
  const updateLearningOutcome = (index, value) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.map((item, i) => i === index ? value : item)
    }));
  };

  // Delete learning outcome
  const deleteLearningOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      learningOutcomes: prev.learningOutcomes.filter((_, i) => i !== index)
    }));
  };

  // Add requirement
  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  // Update requirement
  const updateRequirement = (index, value) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((item, i) => i === index ? value : item)
    }));
  };

  // Delete requirement
  const deleteRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  // Add section
  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: '',
      expanded: true,
      lessons: []
    };
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  // Update section title
  const updateSectionTitle = (sectionId, title) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, title } : section
      )
    }));
  };

  // Delete section
  const deleteSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, expanded: !section.expanded } : section
      )
    }));
  };

  // Add lesson
  const addLesson = (sectionId) => {
  const newLesson = {
    id: Date.now(),
    title: '',
    completed: false,
    videoType: 'external', // Default to external URL
    videoUrl: '', // Store video URL (Cloudinary or external)
    content: '',
    duration: 0
  };
  setFormData(prev => ({
    ...prev,
    sections: prev.sections.map(section =>
      section.id === sectionId
        ? { ...section, lessons: [...section.lessons, newLesson] }
        : section
    )
  }));
};

// Update lesson duration
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

// Update lesson title
const updateLessonTitle = (sectionId, lessonId, title) => {
  setFormData(prev => ({
    ...prev,
    sections: prev.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, title } : lesson
            )
          }
        : section
    )
  }));
};

  // Delete lesson
  const deleteLesson = (sectionId, lessonId) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, lessons: section.lessons.filter(lesson => lesson.id !== lessonId) }
          : section
      )
    }));
  };

  // Add FAQ
  const addFAQ = () => {
    const newFAQ = {
      id: Date.now(),
      question: '',
      answer: ''
    };
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, newFAQ]
    }));
  };

  // Update FAQ
  const updateFAQ = (faqId, field, value) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.map(faq =>
        faq.id === faqId ? { ...faq, [field]: value } : faq
      )
    }));
  };

  // Delete FAQ
  const deleteFAQ = (faqId) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(faq => faq.id !== faqId)
    }));
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && formData.tags.length < 14) {
      const tag = newTag.trim().toLowerCase();
      if (!formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
      }
      setNewTag('');
    } else if (formData.tags.length >= 14) {
      setError('Maximum 14 tags allowed');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle course submission
// REPLACE THE OLD FUNCTION WITH THIS NEW ONE

const handleCreateCourse = async () => {
  try {
    // Your validation logic... make sure to check all required fields
    if (!formData.courseTitle || !formData.shortDescription) {
      setError('Please fill in all required fields.');
      return;
    }
    // Add any other validation you need here...


    // Prepare data for Firestore
    const courseData = {
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: auth.currentUser?.uid || 'anonymous',
      status: formData.isPublished ? 'published' : 'pending'
    };

    // Save to Firestore
    await addDoc(collection(db, 'courses'), courseData);
    
    // IMPORTANT: Clear the saved draft from local storage after success
    localStorage.removeItem('courseDraft');
    
    navigate('/admin/success'); // Or your desired success page

  } catch (err) {
    console.error("Error creating course:", err);
    setError('Failed to submit course: ' + err.message);
  }
};

const updateLessonContent = (sectionId, lessonId, content) => {
  setFormData(prev => ({
    ...prev,
    sections: prev.sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, content } : lesson
            )
          }
        : section
    )
  }));
};

  const steps = [
    { number: 1, title: 'Basic Information', status: 'current' },
    { number: 2, title: 'Course Media', status: 'pending' },
    { number: 3, title: 'Curriculum', status: 'pending' },
    { number: 4, title: 'Additional Information', status: 'pending' },
    { number: 5, title: 'Pricing', status: 'pending' }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
       handleCreateCourse();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="lg:flex items-center justify-between mb-8 flex-wrap hidden">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep === step.number 
                ? 'bg-blue-600 text-white' 
                : currentStep > step.number 
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span className="text-xs mt-1 text-gray-600">{step.title}</span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 mt-[-16px]
              ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  const renderBasicInformation = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Title *
        </label>
        <input
          type="text"
          value={formData.courseTitle}
          onChange={(e) => handleInputChange('courseTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter course title"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Category *
          </label>
          <select
            value={formData.courseCategory}
            onChange={(e) => handleInputChange('courseCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="web-development">Web Development</option>
            <option value="data-science">Data Science</option>
            <option value="mobile-development">Mobile Development</option>
            <option value="design">Design</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course Level *
          </label>
          <select
            value={formData.courseLevel}
            onChange={(e) => handleInputChange('courseLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language *
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleInputChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Number of Students *
          </label>
          <input
            type="number"
            value={formData.maxStudents}
            onChange={(e) => handleInputChange('maxStudents', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter max students"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public / Private Course
          </label>
          <select
            value={formData.publicPrivate}
            onChange={(e) => handleInputChange('publicPrivate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Short Description *
        </label>
        <textarea
          value={formData.shortDescription}
          onChange={(e) => handleInputChange('shortDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter short description"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Course Description *
        </label>
        <div className="border border-gray-300 rounded-md">
          {/* <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
            <button className="p-1 text-gray-600 hover:text-gray-800">B</button>
            <button className="p-1 text-gray-600 hover:text-gray-800 italic">I</button>
            <button className="p-1 text-gray-600 hover:text-gray-800 underline">U</button>
            <button className="p-1 text-gray-600 hover:text-gray-800">≡</button>
            <button className="p-1 text-gray-600 hover:text-gray-800">⚲</button>
          </div> */}
      <div>
    {/* <label className="block text-sm font-medium text-gray-700 mb-2">
        Course Description *
    </label> */}
    <SlateEditor
        content={formData.courseDescription}
        onChange={(newContent) => handleInputChange('courseDescription', newContent)}
    />
</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What will students learn in your course?
          </label>
          {formData.learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={outcome}
                onChange={(e) => updateLearningOutcome(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter learning outcome"
              />
              <button
                onClick={() => deleteLearningOutcome(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addLearningOutcome}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            + Add New Item
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          {formData.requirements.map((req, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={req}
                onChange={(e) => updateRequirement(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter requirement"
              />
              <button
                onClick={() => deleteRequirement(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addRequirement}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            + Add New Item
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featuredCourse}
            onChange={(e) => handleInputChange('featuredCourse', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
        <span className="text-sm text-gray-700">Check this for featured course</span>
      </div>
    </div>
  );

  const renderCourseMedia = () => (
  <div class="space-y-6">
    <h2 class="text-xl font-semibold text-gray-900">Course Media</h2>
    <p class="text-sm text-gray-600">Upload or link a course overview video. Lesson-specific videos can be added in the Curriculum section.</p>

    {/* Course Thumbnail Upload (Cloudinary) */}
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
            Course Thumbnail *
        </label>
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center">
            <div class="space-y-2">
                <div class="text-gray-500">{formData.courseThumbnail ? 'Image Uploaded' : 'No File Selected'}</div>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleThumbnailChange}
                    class="hidden"
                    id="thumbnail-upload"
                />
                <label
                    htmlFor="thumbnail-upload"
                    class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
                >
                    Upload File
                </label>
            </div>
            <div class="mt-4">
                <div class="text-orange-500 text-sm">📎 Upload Image</div>
                <div class="text-xs text-gray-500 mt-1">
                    JPEG, PNG, GIF, and WebP formats, up to 2 MB
                </div>
            </div>
        </div>
    </div>

    {/* Course Overview Video */}
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
            Course Overview Video *
        </label>
        <div class="flex flex-col sm:flex-row sm:space-x-4 mb-4">
            <select
                value={formData.courseVideoType}
                onChange={(e) => handleInputChange('courseVideoType', e.target.value)}
                class="mb-2 sm:mb-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="external">External URL</option>
                <option value="upload">Upload Video</option>
            </select>
            {formData.courseVideoType === 'external' ? (
                <input
                    type="text"
                    value={formData.courseVideoUrl}
                    onChange={handleVideoUrlChange}
                    placeholder="YouTube, Vimeo, or direct video URL"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            ) : (
                <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            )}
        </div>

        <div class="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {formData.courseVideoUrl ? (
                getEmbedUrl(formData.courseVideoUrl)?.includes('youtube.com') ||
                getEmbedUrl(formData.courseVideoUrl)?.includes('vimeo.com') ? (
                    <iframe
                        src={getEmbedUrl(formData.courseVideoUrl)}
                        class="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="Course Video Preview"
                    />
                ) : (
                    <video
                        src={getEmbedUrl(formData.courseVideoUrl)}
                        controls
                        class="w-full h-full object-cover"
                        poster={formData.courseThumbnail}
                    />
                )
            ) : (
                <div class="w-full h-full flex items-center justify-center text-gray-500 text-center p-4">
                    No video selected
                </div>
            )}
            {formData.courseVideoUrl && (
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div class="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div class="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                    </div>
                </div>
            )}
        </div>
    </div>
</div>
);

const renderCurriculum = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-xl font-semibold text-gray-900">Curriculum</h2>
        <button
            onClick={addSection}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center sm:justify-start"
        >
            <Plus className="mr-2" /> Add New Topic
        </button>
    </div>

    <div className="space-y-4">
        {formData.sections.map((section) => (
            <div key={section.id} className="border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-2 sm:p-4 bg-gray-50">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FolderOpen />
                        </button>
                        <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                            className="font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                            placeholder="Enter section title"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => deleteSection(section.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {section.expanded && (
                    <div className="p-2 sm:p-4 space-y-3">
                        {section.lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className="p-3 bg-white border border-gray-200 rounded"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <CirclePlay />
                                        <input
                                            type="text"
                                            value={lesson.title}
                                            onChange={(e) =>
                                                updateLessonTitle(section.id, lesson.id, e.target.value)
                                            }
                                            className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                                            placeholder="Enter lesson title here"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => deleteLesson(section.id, lesson.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Lesson Video and Content Inputs */}
                                <div className="ml-0 sm:ml-8 space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                                        <label className="text-sm font-medium text-gray-700 mb-1 sm:mb-0">
                                            Video Type
                                        </label>
                                        <select
                                            value={lesson.videoType}
                                            onChange={(e) =>
                                                updateLessonVideoType(section.id, lesson.id, e.target.value)
                                            }
                                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="external">External URL</option>
                                            <option value="upload">Upload Video</option>
                                        </select>
                                    </div>

                                    {lesson.videoType === 'external' ? (
                                        <input
                                            type="text"
                                            value={lesson.videoUrl}
                                            onChange={(e) =>
                                                updateLessonVideoUrl(section.id, lesson.id, e.target.value)
                                            }
                                            placeholder="YouTube, Vimeo, or direct video URL"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) =>
                                                handleLessonVideoUpload(section.id, lesson.id, e)
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}

                                    {/* Video Preview */}
                                    {lesson.videoUrl && (
                                        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                                            {getEmbedUrl(lesson.videoUrl)?.includes('youtube.com') ||
                                            getEmbedUrl(lesson.videoUrl)?.includes('vimeo.com') ? (
                                                <iframe
                                                    src={getEmbedUrl(lesson.videoUrl)}
                                                    className="w-full h-full"
                                                    allow="autoplay; encrypted-media"
                                                    allowFullScreen
                                                    title={`Lesson Video Preview ${lesson.id}`}
                                                />
                                            ) : (
                                                <video
                                                    src={getEmbedUrl(lesson.videoUrl)}
                                                    controls
                                                    className="w-full h-full object-cover"
                                                    poster={formData.courseThumbnail}
                                                />
                                            )}
                                            
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                                    <div className="w-0 h-0 border-l-[10px] sm:border-l-[12px] border-l-white border-t-[7px] sm:border-t-[8px] border-t-transparent border-b-[7px] sm:border-b-[8px] border-b-transparent ml-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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

                                    {/* Lesson Content Textarea */}
                                    <SlateEditor
                                        key={lesson.id}
                                        initialContent={lesson.content}
                                        onChange={(content) => updateLessonContent(section.id, lesson.id, content)}
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => addLesson(section.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                            Add Lesson
                        </button>
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
          <button
            onClick={addFAQ}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus /> Add New
          </button>
        </div>
        
        <div className="space-y-3">
          {formData.faqs.map((faq) => (
            <div key={faq.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                  className="text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                  placeholder="Enter FAQ question"
                />
                <button
                  onClick={() => deleteFAQ(faq.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <textarea
                value={faq.answer}
                onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter FAQ answer"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="ml-2 text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add tags..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addTag}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Maximum of 14 keywords. Keywords should be in lowercase. e.g. javascript, react, marketing
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message to a reviewer
        </label>
        <textarea
          value={formData.messageToReviewer}
          onChange={(e) => handleInputChange('messageToReviewer', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your message to the reviewer..."
        />
      </div>

      <div className="bg-pink-50 p-4 rounded-lg">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={formData.copyrightAgreement}
            onChange={(e) => handleInputChange('copyrightAgreement', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Any images, sounds, or other assets that are not my own work, have been appropriately licensed for use in this file preview or main course. 
            Other than these items, this work is entirely my own and I have full rights to sell it here.
          </span>
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => handleInputChange('isPublished', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
        <span className="text-sm text-gray-700">Publish course to student dashboard</span>
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
      
      <div className="flex items-center space-x-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isFree}
            onChange={(e) => handleInputChange('isFree', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
        </label>
        <span className="text-sm text-gray-700">Check if this is a free course</span>
      </div>

      {!formData.isFree && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Price ($)
            </label>
            <input
              type="number"
              value={formData.coursePrice}
              onChange={(e) => handleInputChange('coursePrice', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course price"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.hasDiscount}
              onChange={(e) => handleInputChange('hasDiscount', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Check if this course has discount</span>
          </div>

          {formData.hasDiscount && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Price ($)
              </label>
              <input
                type="number"
                value={formData.discountPrice}
                onChange={(e) => handleInputChange('discountPrice', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter discount price"
              />
              <p className="text-sm text-orange-600 mt-1">This course has 0% Discount</p>
            </div>
          )}
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Expiry Period
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="expiryPeriod"
              value="lifetime"
              checked={formData.expiryPeriod === 'lifetime'}
              onChange={(e) => handleInputChange('expiryPeriod', e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Lifetime</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="expiryPeriod"
              value="limited"
              checked={formData.expiryPeriod === 'limited'}
              onChange={(e) => handleInputChange('expiryPeriod', e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Limited Time</span>
          </label>
        </div>
      </div>

      {formData.expiryPeriod === 'limited' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of months
          </label>
          <input
            type="number"
            value={formData.numberOfMonths}
            onChange={(e) => handleInputChange('numberOfMonths', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter number of months"
          />
          <p className="text-sm text-gray-500 mt-1">
            After purchase, students can access the course until your selected time.
          </p>
        </div>
      )}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInformation();
      case 2:
        return renderCourseMedia();
      case 3:
        return renderCurriculum();
      case 4:
        return renderAdditionalInformation();
      case 5:
        return renderPricing();
      default:
        return renderBasicInformation();
    }
  };

  return (
    <div className="lg:max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 overflow-x-hidden mt-[65px] lg:mt-0 mb-[65px] lg:mb-0">
        {error && <div className="text-center p-4 text-red-600 mb-4">{error}</div>}
        {renderStepIndicator()}
        {renderCurrentStep()}
        
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {currentStep === 5 ? 'Submit Course' : 'Next'}
            {currentStep < 5 && <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;