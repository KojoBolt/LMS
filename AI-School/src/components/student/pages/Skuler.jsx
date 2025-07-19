import React from 'react';
import { Link } from 'react-router-dom';
import commingsoon from '../../../assets/images/beauty.jpg';  
import { useTheme } from '../../../context/ThemeContext'; 


const Skuler = () => {
    const { theme } = useTheme(); 

    const containerBg = theme === 'dark' ? 'bg-[#171717]' : 'bg-white';
    const shadowBg = theme === 'dark' ? 'shadow' : 'shadow-lg'; 



    return (
    <div className={`min-h-screen ${containerBg} flex items-center justify-center p-4 lg:ml-[300px] mt-[65px] lg:mt-0 mb-[65px] lg:mb-0`}>
            <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 items-center gap-8">

                {/* Left Column: Text Content */}
                <div className="text-center md:text-left">
                    <h1 className="text-6xl font-bold text-gray-800 mb-4">
                        COMING <span className="text-[#F6C53F]">SOON!</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto md:mx-0">
                        Skuler, your personal AI learning copilot, is currently working hard to get ready. We will be back soon, please visit again!
                    </p>
                    <Link
                        to="/student/dashboard"
                        className="inline-block bg-black text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#F6C53F] transition-colors"
                    >
                        GO BACK HOME
                    </Link>
                </div>

                {/* Right Column: Image */}
                <div className="flex justify-center">
                    <div className="relative w-full max-w-sm">
                        <div className="absolute -inset-4 bg-purple-200 rounded-2xl blur-2xl opacity-50"></div>
                        <img
                            src={commingsoon}
                            alt="AI Assistant"
                            className={`relative w-full h-auto object-cover rounded-2xl ${shadowBg}`}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Skuler;
