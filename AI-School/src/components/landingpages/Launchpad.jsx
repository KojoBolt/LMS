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
import hero from '../../assets/images/hero.png';

const Launchpad = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#561B06] via-[#000] to-[#561B06] overflow-x-hidden">
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

          <img src={hero} alt="hero" className='w-full h-auto rounded-lg shadow-lg' />

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