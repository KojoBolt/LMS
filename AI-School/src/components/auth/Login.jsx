import React, { useState, useEffect } from "react";
import { 
    signInWithEmailAndPassword, 
    signInWithPopup,
    GoogleAuthProvider 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig"; 
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false); // --- NEW: State for "Remember Me" ---
    const navigate = useNavigate();

    // --- NEW: Effect to check for a remembered email on component load ---
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setEmail(rememberedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!agreedToTerms) {
            setError("You must agree to the Terms of Use and Privacy Policy to log in.");
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // --- NEW: Handle "Remember Me" logic ---
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const userData = docSnap.data();
                localStorage.setItem('userData', JSON.stringify(userData));

                const role = userData.role;
                    if (role === "admin") {
                        navigate("/admin/dashboard");
                    } else if (role === "instructor") {
                        navigate("/instructor/dashboard");
                    } else {
                        navigate("/student/dashboard");
                    }

            } else {
                setError("User data not found. Please contact support.");
            }
        } catch (error) {
            console.error("Login error:", error.code);
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setError("Invalid email or password. Please try again.");
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            let userData;

            if (userDocSnap.exists()) {
                userData = userDocSnap.data();
            } else {
                userData = {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    profilePicUrl: user.photoURL,
                    role: 'student',
                    createdAt: new Date(),
                };
                await setDoc(userDocRef, userData);
            }

            localStorage.setItem('userData', JSON.stringify(userData));

            if (role === "admin") {
                navigate("/admin/dashboard");
            } else if (role === "instructor") {
                // --- THIS IS THE NEW LOGIC ---
                // If the role is 'instructor', send them to the new instructor dashboard
                navigate("/instructor/dashboard");
            } else {
                // Otherwise, they must be a student
                navigate("/student/dashboard");
            }

        } catch (error) {
            console.error("Google login error:", error.code);
            if (error.code !== 'auth/popup-closed-by-user') {
                setError("Failed to sign in with Google. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
            <div className="w-[90%] max-w-6xl mx-auto bg-white flex shadow-lg rounded-lg overflow-hidden">
                {/* Left Panel - Form */}
                <div className="w-full md:w-1/2 p-10">
                    <div className="flex justify-between items-center mb-4">
                        <span></span>
                        <p className="text-sm">
                            Don't have an account?{" "}
                            <a href="/signup" className="text-blue-600 font-medium">
                                Sign up
                            </a>
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-1">Log in to your account</h2>
                        <p className="text-sm text-gray-600">Welcome Back!</p>
                    </div>
                    
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}

                    <div className="flex gap-4 mb-6">
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            {isLoading ? 'Logging in...' : 'Login with Google'}
                        </button>
                    </div>

                    <div className="flex items-center mb-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email address *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@website.com"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium mb-1">Password *</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                                style={{ top: '24px' }}
                            >
                                {showPassword ? <EyeOff size={20} className="mb-[20px]"/> : <Eye size={20} className="mb-[20px]"/>}
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                                Enter, your correct email address and password
                            </p>
                        </div>
                        
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="remember-me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                                />
                                <label htmlFor="remember-me" className="text-sm text-gray-600">Remember me</label>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <input 
                                type="checkbox" 
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mr-2 mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600">
                                I agree to the{" "}
                                <a href="#" className="text-blue-600 underline">
                                    Terms of use
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-blue-600 underline">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 mt-6">© Ai-Skul - All Rights Reserved.</p>
                </div>

                {/* Right Panel - Image/Testimonial */}
                <div className="hidden md:block md:w-1/2 relative p-4">
                    <img
                        src="https://img.freepik.com/free-photo/woman-typing-laptop-warmcolored-environment_24972-2972.jpg"
                        alt="Testimonial"
                        className="w-full h-full object-cover rounded-lg filter brightness-65"
                    />
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <div className="flex items-center mb-2">
                            <span className="text-yellow-400 text-lg">★★★★★</span>
                        </div>
                        <p className="text-xl font-semibold leading-snug text-white">
                            Data Analytics transformed our raw data into actionable insights. It's a game-changer!
                        </p>
                        <p className="mt-2 text-sm">Michael Smith<br />Data analyst</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
