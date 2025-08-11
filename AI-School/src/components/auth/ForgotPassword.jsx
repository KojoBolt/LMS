import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebaseConfig'; 
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsLoading(true);

        if (!email) {
            setError("Please enter your email address.");
            setIsLoading(false);
            return;
        }

        try {
            // This is the core Firebase function
            await sendPasswordResetEmail(auth, email);
            setSuccessMessage("Password reset link sent! Please check your email inbox (and spam folder).");
        } catch (err) {
            console.error("Error sending password reset email:", err);
            // Provide a user-friendly error message
            if (err.code === 'auth/user-not-found') {
                setError("No account found with that email address.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md mx-auto bg-white p-8 shadow-lg rounded-lg">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold mb-1">Forgot Your Password?</h2>
                    <p className="text-sm text-gray-600">No problem. Enter your email below and we'll send you a link to reset it.</p>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}
                {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{successMessage}</div>}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email address *</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@website.com"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#000]"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#000] hover:bg-[#000] text-white font-medium py-2 rounded-lg disabled:bg-[#155DFC] disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button onClick={() => navigate('/login')} className="text-sm text-blue-600 hover:underline">
                        &larr; Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
