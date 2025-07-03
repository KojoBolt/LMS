import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center text-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-5" />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. You have been successfully enrolled in the course and can start learning right away.
        </p>
        <Link
          to="/student/dashboard"
          className="w-full inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          Go to My Courses
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
