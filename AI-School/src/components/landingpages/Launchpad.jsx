import React from 'react';
import Header from './header';
import Intro from './Intro';
import AccessDashboard from './AccessDashboard';
import SkillsCarousel from './SkillsCarousel';
import AccordionSection from './AccordionSection';
import TestimonialsCarousel from './TestimonialsCarousel';
import PricingSection from './PricingSection';
import FAQ from './FAQ';
import PayNow from './PayNow';
import Footer from './Footer';

const Launchpad = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#561B06] via-[#000] to-[#561B06]">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">

        <div style={{ backgroundImage: "url('https://optiver.com/wp-content/uploads/2023/11/AdobeStock_667233159-scaled.jpeg')" }} className="w-full h-full bg-contain bg-no-repeat"></div>
        
      </div>
      <div className="container m-auto px-6 py-8 relative z-10">
        <Header />
        
        {/* Main Content */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-[1200px] m-auto">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="text-gray-300 text-sm uppercase tracking-wide">
              FROM ASPIRING ENTREPRENEUR TO ACHIEVER
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white leading-tight">
                LAUNCH YOUR
              </h1>
              <h1 className="text-4xl font-bold text-[#FB440A] leading-tight">
                HIGH-INCOME CAREER
              </h1>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed max-w-lg">
              Digital Launchpad empowers entrepreneurs with hands-on guidance, expert-led training, and a thriving community—all in one place.
            </p>

            <div className="space-y-4">
              <button className="bg-[#C72713] hover:bg-[#C72713] text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors cursor-pointer">
                GET STARTED NOW
              </button>
              <p className="text-gray-400 text-sm">
                Secure your access today and start your journey.
              </p>
            </div>

            {/* Stats */}
            <div className="flex space-x-16 pt-8">
              <div>
                <div className="text-4xl font-bold text-white">10+</div>
                <div className="text-gray-400 text-sm">Proven Strategies</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">30K+</div>
                <div className="text-gray-400 text-sm">Users</div>
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            {/* Main Dashboard Window */}
            <div className="bg-gray-800 rounded-xl p-1 shadow-2xl">
              {/* Dashboard Header */}
              <div className="bg-gray-700 rounded-t-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-white font-bold text-sm">
                    DIGITAL<br/>LAUNCHPAD
                  </div>
                </div>
                <div className="text-white text-sm">Dashboard</div>
              </div>

              {/* Dashboard Content */}
              <div className="bg-gray-900 rounded-b-lg p-6 space-y-6">
                {/* Profile Section */}
                <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <img src="https://media.istockphoto.com/id/1338134319/photo/portrait-of-young-indian-businesswoman-or-school-teacher-pose-indoors.jpg?s=612x612&w=0&k=20&c=Dw1nKFtnU_Bfm2I3OPQxBmSKe9NtSzux6bHqa9lVZ7A=" alt="Profile" className="w-8 h-8 rounded-full" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Femi Peters</div>
                    <div className="text-gray-400 text-sm">Student</div>
                  </div>
                </div>

                {/* Navigation Menu */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-white p-2 bg-[#C72713] rounded-lg">
                    <div className="w-5 h-5 bg-white rounded-sm"></div>
                    <span className="text-sm">Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 p-2 hover:bg-gray-800 rounded-lg">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Programs</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 p-2 hover:bg-gray-800 rounded-lg">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Live Events</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 p-2 hover:bg-gray-800 rounded-lg">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Resources</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 p-2 hover:bg-gray-800 rounded-lg">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Community</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 p-2 hover:bg-gray-800 rounded-lg">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Recordings</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 p-2 hover:bg-gray-800 rounded-lg">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Support</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-400 p-2 hover:bg-gray-800 rounded-lg">
                    <div className="w-5 h-5 bg-gray-600 rounded-sm"></div>
                    <span className="text-sm">Settings</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Window */}
            <div className="absolute -right-8 top-8 w-96 bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-[#C72713] to-black p-6 text-center">
                <div className="text-white font-bold text-lg mb-2">
                  DIGITAL<br/>LAUNCHPAD
                </div>
                <button className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold text-sm">
                  START WATCHING
                </button>
                <div className="flex justify-center space-x-2 mt-4">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
              </div>

              {/* Content Cards */}
              <div className="p-4 space-y-4">
                <div className="text-white text-xs mb-2">Your progress</div>
                
                {/* Purple Card */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg p-4 relative">
                  <div className="text-white text-sm font-semibold mb-1">Business Launch</div>
                  <div className="text-white/80 text-xs mb-3">Crafting a Compelling Story Entry Points Checklist Blueprint</div>
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="text-white text-2xl font-bold">8</div>
                  </div>
                </div>

                <div className="text-white text-xs">Connect with students</div>
                
                {/* Red Community Card */}
                <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-lg p-4 relative">
                  <div className="text-white text-lg font-bold mb-2">JOIN THE<br/>COMMUNITY</div>
                  <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold text-xs">
                    GET STARTED
                  </button>
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-white/20 rounded-full"></div>
      <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-red-400 rounded-full"></div>
      <div className='mt-[90px]'>

         <Intro />
        <AccessDashboard/>
        <SkillsCarousel />
        <AccordionSection/>
        <TestimonialsCarousel />
        <PricingSection />
        <FAQ/>
        <PayNow />
        <Footer/>
      </div>

    </div>
  );
};

export default Launchpad;