import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../lib/firebaseConfig";
import { 
    createUserWithEmailAndPassword, 
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false); // --- NEW: State for the checkbox ---
    const navigate = useNavigate();

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setError(null);

        // --- NEW: Check if the terms checkbox is checked ---
        if (!agreedToTerms) {
            setError("You must agree to the Terms of Use and Privacy Policy to register.");
            return;
        }

        setIsLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            const role = email === "kojobolt@gmail.com" ? "admin" : "student";

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                email,
                role,
                createdAt: new Date().toISOString(),
                enrolledCourses: [],
            });

            if (role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/student/dashboard");
            }
        } catch (error) {
            console.error("Signup failed:", error);
            if (error.code === "auth/email-already-in-use") {
                setError("This email address is already in use. Please log in.");
            } else {
                setError("Signup failed: " + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setError(null);
        setIsLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: user.uid,
                    name: user.displayName,
                    email: user.email,
                    profilePicUrl: user.photoURL,
                    role: 'student',
                    createdAt: new Date().toISOString(),
                    enrolledCourses: [],
                });
            }
            
            navigate("/student/dashboard");

        } catch (error) {
            console.error("Google signup error:", error.code);
            if (error.code !== 'auth/popup-closed-by-user') {
                setError("Failed to sign up with Google. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
            <div className="w-full max-w-6xl mx-auto bg-white flex shadow-lg rounded-lg overflow-hidden">
                {/* Left Panel - Form */}
                <div className="w-full md:w-1/2 p-10">
                    <div className="flex justify-between items-center mb-4">
                        <span></span>
                        <p className="text-sm">
                            Already have an account?{" "}
                            <a href="/login" className="text-blue-600 font-medium">
                                Log in
                            </a>
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-1">Create your account</h2>
                        <p className="text-sm text-gray-600">Please enter your details to get started</p>
                    </div>

                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}

                    <div className="flex gap-4 mb-6">
                        <button 
                            onClick={handleGoogleSignup}
                            disabled={isLoading}
                            className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-100 disabled:bg-gray-200 disabled:cursor-not-allowed"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                            {isLoading ? 'Processing...' : 'Signup with Google'}
                        </button>
                    </div>

                    <div className="flex items-center mb-6">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="mx-4 text-gray-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <form className="space-y-4" onSubmit={handleEmailSignup}>
                        <div>
                            <label className="block text-sm font-medium mb-1">Full name *</label>
                            <input
                                type="text"
                                placeholder="Mason Taylor"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email address *</label>
                            <input
                                type="email"
                                placeholder="name@website.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password *</label>
                            <input
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Must contain 1 uppercase letter, 1 number, min 8 characters
                            </p>
                        </div>
                        <div className="flex items-start">
                            {/* --- UPDATED: Checkbox is now a controlled component --- */}
                            <input 
                                type="checkbox" 
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="mr-2 mt-1" 
                            />
                            <label className="text-sm text-gray-600">
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
                            {isLoading ? 'Registering...' : 'Register'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 mt-6">© AI-Skul - All Rights Reserved.</p>
                </div>

                {/* Right Panel - Image/Testimonial */}
                <div className="hidden md:block md:w-1/2 relative p-4">
                    <img
                        src="https://img.freepik.com/free-photo/front-view-latin-friends-hanging-out_23-2151139477.jpg"
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

export default Signup;
