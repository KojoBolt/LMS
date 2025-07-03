import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../lib/firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Signup started");

    try {
      console.log("Creating user with:", { email, password, name });

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update displayName in Firebase Auth profile
      await updateProfile(user, { displayName: name });

      // Define user role
      const role = email === "kojobolt@gmail.com" ? "admin" : "student";

      // Store user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      console.log("User and Firestore document created");

      // Redirect based on role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("Email already exists. Try logging in.");
      } else {
        alert("Signup failed: " + error.message);
      }
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
              <a href="#" className="text-blue-600 font-medium">
                Log in
              </a>
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1">Create your account</h2>
            <p className="text-sm text-gray-600">Please enter your details to get started</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-gray-100">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Signup with Google
            </button>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
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
              Register
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-6">© SquareUI design system All Rights Reserved.</p>
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
