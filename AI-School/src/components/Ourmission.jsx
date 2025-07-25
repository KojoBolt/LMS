import React from 'react';
import Founder from '../assets/images/founders.jpg'
import HeroCard from "./HeroCard";
import NavBar from "./NavBar";
import CountUp from 'react-countup';

const Ourmission = () => {
  return (
    <div className="bg-gradient-to-bl from-black to-[#002786] text-white min-h-screen font-sans antialiased">
<div className="fixed top-0 w-full z-50 ">
        <NavBar />
      </div>
      <div className="container mx-auto px-4 py-16 sm:py-24 lg:px-8">

        {/* Section 1: Hero / Introduction */}
        <section className="text-center space-y-8 mt-[65px]">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            To Revolutionize The <br /> Education System
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            One student at a time, we hope to empower the next generation of entrepreneurs.
          </p>
          <div className=" pt-6 lg:flex lg:justify-center lg:gap-9 lg:pt-[90px]">
            <p className="text-6xl md:text-7xl font-bold text-gray-100"><CountUp end={30000} duration={3} separator="," />+</p>
            <p className="text-sm text-gray-500 tracking-widest uppercase mt-2">
              Total Number of Students <br /> transformed through our programs
            </p>
          </div>
        </section>

        <hr className="border-t border-gray-800 my-14" />

        {/* Section 2: Founder */}
        <section className="text-center space-y-12">
          <div className="space-y-2">
            <p className="text-sm text-gray-400 tracking-wider">John Doe</p>
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">Our Founder</h2>
          </div>
          <div className="flex justify-center px-4">
            <div className="relative group">
               <div className="absolute -inset-0.5 rounded-lg blur-lg opacity-40 group-hover:opacity-75 transition duration-300"></div>
                <img src={Founder} alt="Our Founder, Iman Ghadzi" className="relative rounded-lg lg:max-w-[60%] max-w-full w-full shadow-xl mx-auto" />
            </div>
          </div>
          <section className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-16">
          {/* Left Column: Section Title */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-white lg:mt-[30px]">
              Purpose
            </h2>
          </div>
          
          {/* Right Column: Section Content */}
          <div className="mt-6 lg:mt-0 lg:col-span-9 lg:w-[90%]">
            <h3 className="text-3xl font-medium tracking-wide text-white">
              To Revolutionize The Education System
            </h3>
            <div className="mt-8 space-y-6 text-gray-300 leading-relaxed text-left">
              <p>
                We strive towards a simple but ambitious mission: to reform the education system by offering world-class learning rooted in experience and real-life application at a fraction of the cost of traditional academic institutions.
              
              
                Every program we produce must adhere to our exacting standards and our commitment to students is unparalleled with direct contact to coaches and a thriving community.
              </p>
            </div>
          </div>
        </section>

        {/* Divider */}
        <hr className="my-16 sm:my-20 border-t border-white/10" />

        {/* Journey Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 lg:gap-x-16">
          {/* Left Column: Section Title */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-bold text-white lg:w-[90%]">
              Journey
            </h2>
          </div>
          
          {/* Right Column: Section Content */}
          <div className="mt-6 lg:mt-0 lg:col-span-9">
            <div className="space-y-6 text-gray-300 leading-relaxed text-left">
              <p>
                Educate was founded by Iman Gadzhi, a British entrepreneur and digital marketer in 2018 and has been responsible for the education and careers of hundreds of thousands of students across the world.
              
            
                Initially specialising in agency growth and personal branding, Educate has expanded its curriculum to support careers in a wide variety of disciplines including eCommerce, copywriting and more.
              
                In 2022, the organisation adopted 'Educate' as its official name, reflecting its mission statement and ethos.
              </p>
            </div>
          </div>
        </section>
        </section>

        <hr className="border-t border-gray-800 my-24" />

        {/* Section 3: Philanthropy */}
        <HeroCard/>

      </div>
    </div>
  );
};

export default Ourmission;