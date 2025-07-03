import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebaseConfig"; // Adjust path to your firebase config
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user role from Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      console.log("User data fetched:", docSnap.data());
      if (docSnap.exists()) {
        const role = docSnap.data().role;

        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        alert("User data not found in Firestore.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
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

          <div className="flex gap-4 mb-6">
            <button className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-100">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Login with Google
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
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must contain 1 uppercase letter, 1 number, min 8 characters
              </p>
            </div>
            <div className="flex items-start">
              <input type="checkbox" className="mr-2 mt-1" />
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
            >
              Login
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-6">© SquareUI design system All Rights Reserved.</p>
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
