import React, { useState, useEffect } from 'react';
import { auth, db } from '../../lib/firebaseConfig'; 
import { onAuthStateChanged, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const AdminProfile = () => {
    // --- State for current admin's profile ---
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const [profilePictureName, setProfilePictureName] = useState('No file chosen');
    
    // --- State for password change ---
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- State for adding a new admin ---
    const [newAdminName, setNewAdminName] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [newAdminPictureFile, setNewAdminPictureFile] = useState(null);

    // --- State for UI feedback ---
    const [loading, setLoading] = useState(true);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // --- Fetch current admin's data ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setFirstName(userData.firstName || '');
                    setLastName(userData.lastName || '');
                    setEmail(currentUser.email);
                    setProfilePicturePreview(userData.profilePicUrl || 'https://placehold.co/80x80/1F2A37/9CA3AF?text=Admin');
                }
            } else {
                // Handle not logged in
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
            const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            return data.secure_url;
        } catch (err) {
            setError('Image upload failed: ' + err.message);
            return null;
        }
    };

    // --- Profile Update Logic ---
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
                if (!newProfilePicUrl) { setIsUpdatingProfile(false); return; }
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
            setError(err.message);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    // --- Password Update Logic ---
    const handlePasswordUpdate = async () => {
        if (!user || !currentPassword || !newPassword) return setError("Please fill all password fields.");
        if (newPassword !== confirmPassword) return setError("New passwords do not match.");
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
            setError(err.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // --- Add New Admin Logic ---
    const handleNewAdminPictureChange = (e) => {
        const file = e.target.files[0];
        if (file) setNewAdminPictureFile(file);
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        if (!newAdminName || !newAdminEmail || !newAdminPassword) {
            return setError("Please fill in all fields for the new admin.");
        }
        setIsCreatingAdmin(true);
        setError(null);
        setSuccessMessage('');
        try {
            let profilePicUrl = '';
            if (newAdminPictureFile) {
                profilePicUrl = await handleFileUpload(newAdminPictureFile);
                if (!profilePicUrl) { setIsCreatingAdmin(false); return; }
            }
            const functions = getFunctions();
            const createAdmin = httpsCallable(functions, 'createAdminUser');
            const result = await createAdmin({
                email: newAdminEmail,
                password: newAdminPassword,
                name: newAdminName,
                profilePicUrl: profilePicUrl,
            });
            if (result.data.success) {
                setSuccessMessage(`New admin created successfully with UID: ${result.data.uid}`);
                setNewAdminName('');
                setNewAdminEmail('');
                setNewAdminPassword('');
                setNewAdminPictureFile(null);
            } else {
                throw new Error(result.data.error || "Failed to create admin.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    if (loading) {
        return <div className="p-8 ml-[300px]">Loading profile...</div>;
    }
//     const makeMeAdmin = async () => {
//     if (!window.confirm("Are you sure you want to set yourself as the initial admin? This should only be done once.")) {
//         return;
//     }
//     try {
//         const functions = getFunctions();
//         const setAdminRole = httpsCallable(functions, 'setInitialAdmin');
//         const result = await setAdminRole();
//         alert('Success! ' + result.data.message);
//     } catch (err) {
//         console.error(err);
//         alert('Error: ' + err.message);
//     }
// };

    return (
        <div className="lg:max-w-6xl lg:mx-auto p-8 bg-white lg:ml-[300px] w-[100%] overflow-x-hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-5 mt-[30px]">Profile</h1>

            {error && <div className="my-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
            {successMessage && <div className="my-4 p-3 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>}

            {/* --- Profile Details Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-900">Profile details</h2>
                    <p className="mt-1 text-sm text-gray-600">Update your personal information.</p>
                </div>
                <div className="md:col-span-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2 flex items-center gap-4">
                            <img src={profilePicturePreview} alt="Profile" className="w-20 h-20 rounded-lg object-cover" />
                            <div className="flex items-center gap-2">
                                <label htmlFor="file-upload" className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700">Choose File</label>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handlePictureChange} accept="image/*" />
                                <span className="text-gray-500 text-sm">{profilePictureName}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                            <input type="email" value={email} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                        </div>
                        <div className="sm:col-span-2 text-right">
                            <button onClick={handleProfileUpdate} disabled={isUpdatingProfile} className="bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-700 disabled:bg-gray-400">
                                {isUpdatingProfile ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-10 border-gray-300" />

            {/* --- Password Update Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-900">Update password</h2>
                    <p className="mt-1 text-sm text-gray-600">Ensure your account is using a long, random password.</p>
                </div>
                <div className="md:col-span-2">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="text-right">
                            <button onClick={handlePasswordUpdate} disabled={isUpdatingPassword} className="bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-700 disabled:bg-gray-400">
                                {isUpdatingPassword ? 'Updating...' : 'Update password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Add New Admin Section --- */}
            <hr className="my-10 border-gray-300" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Admin</h2>
                    <p className="mt-1 text-sm text-gray-600">Create a new user account with administrator privileges.</p>
                </div>
                <div className="md:col-span-2">
                    <form onSubmit={handleCreateAdmin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
                            <input type="file" onChange={handleNewAdminPictureChange} accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        <div className="text-right">
                            {/* <button onClick={makeMeAdmin} className="bg-yellow-500 text-white p-4 rounded-lg mb-4">
            Make Me Initial Admin (Click Once)
        </button> */}
                            <button type="submit" disabled={isCreatingAdmin} className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400">
                                {isCreatingAdmin ? 'Creating Admin...' : 'Create Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
