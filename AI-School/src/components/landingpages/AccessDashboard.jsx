import React from 'react';
import man from '../../assets/images/man.jpg'
import inperson from '../../assets/images/inperson.jpg';
import iphone from '../../assets/images/iphone.png';
import Desktop from '../../assets/images/Desktop.png';


const AccessDashboard = () => {
 
  return (
    <div className="min-h-screen text-white p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black tracking-wide mb-4">
          WHAT YOU WILL GET ACCESS TO
        </h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Section - Dashboard */}
        <div className="space-y-6">
          <div className="bg-gradient-to-bl from-[#9C3413] via-[#232121] to-[#232121] rounded-lg p-6">
            <h2 className="text-2xl font-bold text-[#FB440A] mb-4">
              10+ PROVEN ONLINE STRATEGIES
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              You'll have a personalized dashboard with access to all materials, step-by-step instructions, and progress tracking—keeping your journey organized and seamless.
            </p>
            
            {/* Dashboard Preview */}
            <div className="lg:ml-[90px]">
                <img src="https://assets.justinmind.com/wp-content/uploads/2020/02/dashboard-examples-social-media.png" alt="launchpad" className='w-full h-auto rounded-lg shadow-lg' />

            </div>
          </div>
        </div>

        {/* Right Section - Skills */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#9C3413] via-[#232121] to-[#232121] rounded-lg p-6 w-[400px]">
            <h2 className="text-2xl font-bold text-[#FB440A] mb-4">
              THE SKILLS THAT WORKS FOR YOU.
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              Each person is different. What works for everyone else not necessarily will work for you. Discover how to select the perfect online path based on your unique personality type.
            </p>
            
            {/* Skills Grid */}
            <img src="https://www.skillshub.com/wp-content/uploads/2023/04/collage-illustration.jpg" alt="" className='w-full h-auto rounded-lg shadow-lg' />
          </div>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
        {/* Top Emerging Trends */}
        <div className="bg-[#131212] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#FB440A] mb-4">
            TOP EMERGING TRENDS
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Constant new programs releases for you to learn how to identify and capitalize on emerging online trends before anyone else knows about them.
          </p>
        </div>

        {/* Constant Updates */}
        <div className="bg-[#131212] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#FB440A] mb-4">
            CONSTANT UPDATES
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            Digital Launchpad evolves with you. Regularly updated content and new programs ensure you stay ahead with the latest strategies and opportunities
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Calls with Iman Gadzhi */}
        <div className="bg-gradient-to-bl from-[#9C3413] via-[#232121] to-[#232121] rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#FB440A] mb-4">
            CALLS WITH IMAN GADZHI
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            Join monthly coaching calls with Iman and your questions directly to him to get advice straight from Iman himself on how to deal with the specific challenges you're facing.
          </p>
          
          {/* Video Call Preview */}
          <div className="relative bg-gradient-to-br from-green-600 via-[#232121] to-green-600 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {/* Live Video Frame */}
              <div className="relative bg-gray-700 rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
                {/* Placeholder for Iman's image */}
                <img src={man} alt="" />
              </div>
            </div>
          </div>
        </div>

        {/* In-Person Events */}
        <div style={{ backgroundImage: `url(${inperson})`, backgroundSize: 'cover', backgroundPosition: 'center' }} className="w-full h-full p-6 rounded-lg shadow-lg bg-no-repeat bg-cover opacity-60">

          <h2 className="text-2xl font-bold text-[#FB440A] mb-4">
            IN-PERSON EVENTS
          </h2>
          <p className="text-black text-lg leading-relaxed mb-6">
            Unlock the opportunity to attend in-person events around the world with Iman and other successful students.
          </p>
          </div>
        
      </div>

      {/* Mobile App and Exclusive Community Section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
  {/* Mobile App */}
  <div className="bg-gradient-to-br from-[#9C3413] via-[#232121] to-[#232121] rounded-lg p-6 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
    {/* Mobile Phone Mockup */}
    <div className="flex-shrink-0">
      <img
        src={iphone}
        alt="iPhone Mockup"
        className="w-32 md:w-38 h-auto rounded-lg shadow-lg"
      />
    </div>

    {/* Mobile App Text */}
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-xl md:text-2xl font-bold text-[#FB440A] mb-3 md:mb-4 lg:pt-6">
        MOBILE RESPONSIVE
      </h2>
      <p className="text-gray-300 text-base md:text-lg leading-relaxed">
        Access programs on the go with our custom app. Learn high-impact skills
        and advance your career anytime, anywhere.
      </p>
    </div>
  </div>

  {/* Exclusive Community */}
  <div className="bg-[#232121] rounded-lg p-6 items-center md:items-start gap-6 md:gap-3 h-[350px] ">
    {/* Text */}
    <div className="flex justify-center md:justify-start ">
      <img src={Desktop} alt="" className='w-[300px] h-[200px] m-auto' />
    </div>
    
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-[16px] md:text-[24px] font-bold text-[#FB440A] mb-3 md:mb-4">
        EXCLUSIVE COMMUNITY
      </h2>
      <p className="text-gray-300 text-base md:text-[16px] leading-relaxed text-[13px]">
        Connect with Iman Gadzhi's 8-figure network through live calls with
        successful entrepreneurs.
      </p>
    </div>
  </div>
</div>

    </div>
  );
};

export default AccessDashboard;