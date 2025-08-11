import React from 'react';
import founder from '../assets/images/founders.jpg';
import DigitalPack from '../assets/images/action.jpg'



const HeroCard = () => {
  return (
    <div className=" relative flex items-center justify-between bg-gradient-to-br from-[#040017] via-[#36040d] to-[#47010e] p-8 rounded-3xl overflow-hidden">
       <div
  className="absolute inset-0 z-0 block lg:hidden bg-cover bg-center"
  style={{ backgroundImage: 'url("https://educate.io/images/Banner-Pics-Tablet.webp")' }}
></div>
      {/* Left Content */}
      <div className="w-1/2 text-white space-y-6 pl-8">
        <h1 className="lg:text-5xl font-bold leading-tight">
          READY TO <br />
          START DIGITAL <br />
          LAUNCHPAD?
        </h1>
        <button className="bg-white text-black lg:px-6 lg:py-6 px-3 py-2 rounded-full font-semibold shadow-md hover:bg-gray-200 transition text-[10px] lg:text-[15px]">
          GET STARTED TODAY
        </button>
      </div>

      {/* Right Content - Image Cards */}
      <div className="w-1/2 h-[320px] lg:grid grid-cols-2 gap-4 transform pr-12 hidden">
        <img
          src={DigitalPack}
          alt="Pathway to Profits"
          className="rounded-xl shadow-lg max-w-7xl"
        />
        {/* <img
          src={founder}
          alt="Digital Don"
          className="rounded-xl shadow-lg"
        />
        <img
          src={founder}
          alt="Digital Launchpad"
          className="rounded-xl shadow-lg"
        />
        <img
          src={founder}
          alt="Ad Architect"
          className="rounded-xl shadow-lg"
        /> */}
      </div>
    </div>
  );
};

export default HeroCard;
