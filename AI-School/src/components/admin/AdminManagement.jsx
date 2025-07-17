import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebaseConfig';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { UserPlus, Trash2, ShieldCheck } from 'lucide-react';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Effect to fetch all users with the 'admin' role
    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", "admin"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const adminsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const uniqueAdmins = adminsData.reduce((unique, admin) => {
                const existingAdmin = unique.find(existing => 
                    existing.email === admin.email || 
                    existing.uid === admin.uid ||
                    existing.id === admin.id
                );
                
                if (!existingAdmin) {
                    unique.push(admin);
                } else {
                    const existingIndex = unique.findIndex(existing => 
                        existing.email === admin.email || 
                        existing.uid === admin.uid ||
                        existing.id === admin.id
                    );
                    
                    const existingFieldCount = Object.keys(unique[existingIndex]).length;
                    const currentFieldCount = Object.keys(admin).length;
                    
                    if (currentFieldCount > existingFieldCount || 
                        (admin.createdAt && (!unique[existingIndex].createdAt || admin.createdAt > unique[existingIndex].createdAt))) {
                        unique[existingIndex] = admin;
                    }
                }
                
                return unique;
            }, []);
            
            uniqueAdmins.sort((a, b) => {
                if (a.name && b.name) {
                    return a.name.localeCompare(b.name);
                }
                return 0;
            });
            
            setAdmins(uniqueAdmins);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching admins:", err);
            setError("Failed to load admin list.");
            setLoading(false);
        });

        return () => unsubscribe(); 
    }, []);

    const handleDeleteAdmin = async (adminId, adminName) => {
        if (adminId === auth.currentUser?.uid) {
            alert("You cannot delete your own account.");
            return;
        }

        if (window.confirm(`Are you sure you want to delete the admin "${adminName}"? This action cannot be undone.`)) {
            try {
                const functions = getFunctions();
                const deleteAdmin = httpsCallable(functions, 'deleteAdminUser');
                await deleteAdmin({ uid: adminId });
                alert(`Admin ${adminName} has been deleted.`);
            } catch (err) {
                console.error("Error deleting admin:", err);
                alert("Failed to delete admin: " + err.message);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Management</h1>
            <p className="mt-1 text-sm text-gray-600">View and manage administrator accounts.</p>
        </div>
        <button 
            onClick={() => navigate('/admin/profile')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
            <UserPlus size={18} />
            Add New Admin
        </button>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="divide-y divide-gray-200">
            {admins.map((admin) => (
                <div key={admin.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                        <img
                            src={admin.profilePicUrl || `https://ui-avatars.com/api/?name=${admin.name}&background=random&color=fff`}
                            alt={admin.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <p className="font-semibold text-gray-900">{admin.name}</p>
                            <p className="text-sm text-gray-500">{admin.email}</p>
                        </div>
                        {auth.currentUser?.uid === admin.id && (
                            <span className="text-xs bg-green-100 text-green-800 font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                <ShieldCheck size={14} /> You
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                        disabled={auth.currentUser?.uid === admin.id}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed self-start sm:self-auto"
                        title={auth.currentUser?.uid === admin.id ? "Cannot delete yourself" : "Delete Admin"}
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