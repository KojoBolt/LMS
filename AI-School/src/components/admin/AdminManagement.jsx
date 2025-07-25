import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { UserPlus, Trash2, ShieldCheck } from 'lucide-react';

const AdminManagement = () => {
    // State now holds all relevant users (admins and instructors)
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // --- THIS IS THE FIX ---
        // The query now fetches all documents where the role is either 'admin' OR 'instructor'.
        const q = query(collection(db, "users"), where("role", "in", ["admin", "instructor"]));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const usersData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Your original de-duplication logic remains unchanged
            const uniqueUsers = usersData.reduce((unique, user) => {
                const existingUser = unique.find(existing => 
                    existing.email === user.email || 
                    existing.uid === user.uid ||
                    existing.id === user.id
                );
                
                if (!existingUser) {
                    unique.push(user);
                } else {
                    const existingIndex = unique.findIndex(existing => 
                        existing.email === user.email || 
                        existing.uid === user.uid ||
                        existing.id === user.id
                    );
                    
                    const existingFieldCount = Object.keys(unique[existingIndex]).length;
                    const currentFieldCount = Object.keys(user).length;
                    
                    if (currentFieldCount > existingFieldCount || 
                        (user.createdAt && (!unique[existingIndex].createdAt || user.createdAt > unique[existingIndex].createdAt))) {
                        unique[existingIndex] = user;
                    }
                }
                
                return unique;
            }, []);
            
            uniqueUsers.sort((a, b) => {
                if (a.name && b.name) {
                    return a.name.localeCompare(b.name);
                }
                return 0;
            });
            
            setUsers(uniqueUsers); // Update state with the list of users
            setLoading(false);
        }, (err) => {
            console.error("Error fetching users:", err);
            setError("Failed to load user list.");
            setLoading(false);
        });

        return () => unsubscribe(); 
    }, []);

    const handleDeleteUser = async (userId, userName) => {
        if (userId === auth.currentUser?.uid) {
            alert("You cannot delete your own account.");
            return;
        }

        if (window.confirm(`Are you sure you want to delete the user "${userName}"? This action cannot be undone.`)) {
            try {
                const functions = getFunctions();
                // This function can be reused as it just deletes a user by UID
                const deleteUser = httpsCallable(functions, 'deleteAdminUser');
                await deleteUser({ uid: userId });
                alert(`User ${userName} has been deleted.`);
            } catch (err) {
                console.error("Error deleting user:", err);
                alert("Failed to delete user: " + err.message);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>;
    }

    if (error) {
        return <div className="p-8 ml-[300px] text-red-500">{error}</div>;
    }

    return (
        <div className="lg:max-w-6xl lg:mx-auto p-4 sm:p-6 lg:p-8 bg-white w-full mt-[30px] lg:ml-[300px]">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="mt-1 text-sm text-gray-600">View and manage administrator and instructor accounts.</p>
                </div>
                <button 
                    onClick={() => navigate('/admin/profile')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <UserPlus size={18} />
                    Add New User
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4 hover:bg-gray-50">
                            <div className="flex items-center gap-4">
                                <img
                                    src={user.profilePicUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff`}
                                    alt={user.name}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    {/* Added a badge to show the user's role */}
                                    <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {user.role}
                                    </span>
                                </div>
                                {auth.currentUser?.uid === user.id && (
                                    <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                        <ShieldCheck size={14} /> You
                                    </span>
                                )}
                            </div>
                            <button 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                disabled={auth.currentUser?.uid === user.id}
                                className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed self-start sm:self-auto"
                                title={auth.currentUser?.uid === user.id ? "Cannot delete yourself" : "Delete User"}
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminManagement;
