import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebaseConfig'; 
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const InstructorProfile = () => {
    // State for user data and profile picture
    const [user, setUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [profilePictureName, setProfilePictureName] = useState('No file chosen');

    // State for UI feedback
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // --- Fetch User Data ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setProfileData(userData);
                    setProfilePicturePreview(userData.profilePicUrl || `https://ui-avatars.com/api/?name=${userData.name || 'I'}&background=random&color=fff`);
                }
            } else {
                // Handle user not logged in
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Cloudinary File Upload Logic ---
    const handleFileUpload = async (file) => {
        if (!file) return null;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.secure_url;
        } catch (err) {
            setError('Image upload failed: ' + err.message);
            return null;
        }
    };

    // --- Profile Picture Update Logic ---
    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setProfilePictureName(file.name);
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const handleProfilePictureUpdate = async () => {
        if (!user || !profilePictureFile) {
            setError("Please choose a new file to upload.");
            return;
        }
        setIsUploading(true);
        setError(null);
        setSuccessMessage('');
        try {
            const newProfilePicUrl = await handleFileUpload(profilePictureFile);
            if (!newProfilePicUrl) {
                setIsUploading(false);
                return; // Stop if upload fails
            }

            // Update the URL in the user's Firestore document
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { profilePicUrl: newProfilePicUrl });

            // Update the photoURL in Firebase Authentication
            await updateProfile(auth.currentUser, { photoURL: newProfilePicUrl });

            setSuccessMessage("Profile picture updated successfully!");
            setProfilePictureFile(null);
            setProfilePictureName('No file chosen');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen ml-[300px]"><div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="lg:max-w-4xl lg:mx-auto p-8 bg-white lg:ml-[300px] w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

            {error && <div className="my-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
            {successMessage && <div className="my-4 p-3 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Description */}
                    <div className="md:col-span-1">
                        <h2 className="text-xl font-semibold text-gray-900">Your Information</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Your name and email are managed by the site administrator. You can update your profile picture here.
                        </p>
                    </div>

                    {/* Right Column: Form */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center gap-4">
                            <img
                                src={profilePicturePreview}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    Choose File
                                </label>
                                <input 
                                    id="file-upload" 
                                    name="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handlePictureChange} 
                                    accept="image/*"
                                />
                                <span className="text-gray-500 text-sm">{profilePictureName}</span>
                            </div>
                        </div>
                        
                        {/* Name (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={profileData?.name || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={profileData?.email || ''}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Save Button */}
                        <div className="text-right">
                            <button 
                                onClick={handleProfilePictureUpdate}
                                disabled={isUploading || !profilePictureFile}
                                className="bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isUploading ? 'Uploading...' : 'Update Picture'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorProfile;
