// import React from 'react'
// import { Navigate } from 'react-router-dom'

// const ProtectedRoute = ({ children, role }) => {
//   const user = JSON.parse(localStorage.getItem('user') || '{}')
//   const isAuthenticated = user.token
//   const userRole = user.role

//   if (!isAuthenticated) {
//     return <Navigate to="/auth/login" replace />
//   }

//   if (role && userRole !== role) {
//     return <Navigate to="/" replace />
//   }

//   return children
// }

// export default ProtectedRoute

import React from 'react'

// function ProtectedRoute() {
//   return (
//     <div>ProtectedRoute</div>
//   )
// }

// export default ProtectedRoute

// components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { account, databases, Query } from "../lib/appwriteConfig";

const ProtectedRoute = ({ children, role: requiredRole }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const session = await account.get();
        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DB_ID,
          import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
          [Query.equal("email", session.email)]
        );
        setUserRole(res.documents[0]?.role || "student");
      } catch (err) {
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (userRole === requiredRole) {
    return children;
  } else {
    return <Navigate to="/unauthorized" />;
  }
};

export default ProtectedRoute;
