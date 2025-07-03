import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Submitted Successfully!</h1>
        <p className="text-gray-600 mb-6">
         Your course has been successfully published and is now available to learners.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/create-course')}
            className="inline-flex items-center px-6 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Create Another Course
          </button>
          <button
            onClick={() => navigate('/dashboard')} // Adjust path to your dashboard route
            className="inline-flex items-center px-6 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;