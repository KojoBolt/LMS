import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebaseConfig'; 
import { onAuthStateChanged, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useTheme } from '../../context/ThemeContext'; 

const Profile = () => {
    // State for user data and form inputs
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    
    // State for profile picture handling
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [profilePictureName, setProfilePictureName] = useState('No file chosen');

    // State for password change
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for UI feedback
    const [loading, setLoading] = useState(true);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const { theme } = useTheme(); 

    // --- Fetch User Data ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    // Populate form with existing data
                    setFirstName(userData.firstName || '');
                    setLastName(userData.lastName || '');
                    setEmail(currentUser.email);
                    setProfilePicturePreview(userData.profilePicUrl || `https://ui-avatars.com/api/?name=${userData.firstName || 'U'}&background=random`);
                }
            } else {
                console.log("No user is logged in.");
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
            if (data.error) {
                throw new Error(data.error.message);
            }
            return data.secure_url;
        } catch (err) {
            console.error('Cloudinary upload failed:', err);
            setError('Image upload failed. Please try again.');
            return null;
        }
    };

    const handlePictureChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePictureFile(file);
            setProfilePictureName(file.name);
            setProfilePicturePreview(URL.createObjectURL(file));
        }
    };

    const handleProfileUpdate = async () => {
        if (!user) return setError("You must be logged in.");

        setIsUpdatingProfile(true);
        setError(null);
        setSuccessMessage('');

        try {

            let newProfilePicUrl = profilePicturePreview; 
            if (profilePictureFile) {
                newProfilePicUrl = await handleFileUpload(profilePictureFile);
                if (!newProfilePicUrl) {
                    setIsUpdatingProfile(false);
                    return;  
                }
            }

            const updatedData = {
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                profilePicUrl: newProfilePicUrl,
            };

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, updatedData);

            await updateProfile(auth.currentUser, {
                displayName: `${firstName} ${lastName}`,
                photoURL: newProfilePicUrl,
            });

            setSuccessMessage("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            setError(err.message);
        } finally {
            setIsUpdatingProfile(false);
        }
    };
    
    const handlePasswordUpdate = async () => {
        if (!user) return setError("You must be logged in.");
        if (newPassword !== confirmPassword) return setError("New passwords do not match.");
        if (newPassword.length < 6) return setError("New password must be at least 6 characters long.");

        setIsUpdatingPassword(true);
        setError(null);
        setSuccessMessage('');

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
        
            await updatePassword(user, newPassword);

            setSuccessMessage("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error("Error updating password:", err);
            setError(err.message);  
        } finally {
            setIsUpdatingPassword(false);
        }
    };
    const containerBg = theme === 'dark' ? 'bg-[#171717]' : 'bg-white';
    const textColor = theme === 'dark' ? 'text-white' : 'text-black';
    const cardColor = theme === 'dark' ? 'bg-[#262626]' : 'bg-gray-100';
    const spinnerColor = theme === 'dark' ? 'border-white' : 'border-black';
    const borderColor = theme === 'dark' ? 'border-black/50' : 'border-gray-200';
    const btnColor = theme === 'dark' ? 'bg-gray-700' : 'bg-black'

    if (loading) {
        return <div className={`flex justify-center items-center h-screen ${containerBg}`}>
            <div className={`w-12 h-12 border-4 ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
        </div>;
    }

    return (
        <div className={`p-3 sm:p-4 md:p-6 ${containerBg} h-screen lg:ml-[300px] mt-[60px] lg:mt-0 mb-[60px] lg:mb-0 overflow-x-hidden`}>
            <h1 className={`text-3xl font-bold ${textColor} mb-5 mt-[30px]`}>Profile</h1>

            {/* --- Profile Details Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className={`text-xl font-semibold ${textColor}`}>Profile details</h2>
                    <p className={`mt-1 text-sm ${textColor}`}>
                        This information will be displayed publicly so be careful what you share.
                    </p>
                </div>

                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2 flex items-center gap-4">
                            <img
                                src={profilePicturePreview}
                                alt="Profile"
                                className="w-20 h-20 rounded-lg object-cover"
                            />
                            <div className="flex items-center gap-2">
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                                >
                                    Choose File
                                </label>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handlePictureChange} accept="image/*"/>
                                <span className="text-gray-500 text-sm">{profilePictureName}</span>
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>First name</label>
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${textColor}`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>Last name</label>
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${textColor}`}
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>Email address</label>
                            <input
                                type="email"
                                value={email}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="sm:col-span-2 text-right">
                            <button 
                                onClick={handleProfileUpdate}
                                disabled={isUpdatingProfile}
                                className={`${btnColor} text-white px-6 py-3 rounded font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400`}
                            >
                                {isUpdatingProfile ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {error && <div className="mt-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
            {successMessage && <div className="mt-4 p-3 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>}

            <hr className="my-10 border-gray-300" />

            {/* --- Password Update Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-[65px] lg:mb-0">
                <div className="md:col-span-1">
                    <h2 className={`text-xl font-semibold ${textColor}`}>Update password</h2>
                    <p className={`mt-1 text-sm ${textColor}`}>
                        Ensure your account is using a long, random password to stay secure.
                    </p>
                </div>

                <div className="md:col-span-2">
                    <div className="space-y-6">
                        <div>
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>Current password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter your current password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>New password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${textColor} mb-1`}>Confirm new password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="text-right">
                            <button 
                                onClick={handlePasswordUpdate} 
                                disabled={isUpdatingPassword}
                                className={`${btnColor} text-white px-6 py-3 rounded font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400`}
                            >
                                {isUpdatingPassword ? 'Updating...' : 'Update password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
