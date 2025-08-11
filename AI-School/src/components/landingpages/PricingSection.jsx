import React from "react";
import { Check } from "lucide-react";
import Btn from "./Btn";
import pay from "../../assets/images/pay.png"; 
import { Rocket } from 'lucide-react';


const PricingSection = () => {
  return (
    <div className="bg-black relative py-16 px-4">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,0,0,0.6)_0%,_transparent_70%)]"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <p className="text-orange-500 font-semibold tracking-wide uppercase">
          Pricing
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-10">
          Forms of Membership in Digital Launchpad
        </h2>

        {/* Pricing Card */}
        <div className="bg-[#111] rounded-2xl p-8 md:p-10 text-left relative max-w-2xl mx-auto border border-gray-700">
          {/* Top badges */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {/* <div className="w-6 h-6 bg-orange-600 rounded-full"></div> */}
              <span className="text-white font-bold text-[12px]">DIGITAL LAUNCHPAD</span>
            </div>
            <span className="bg-[#411B10] text-white px-3 py-2 rounded-full md:text-sm text-[12px] flex items-center">
             <Rocket className="w-4 h-4 inline-block mr-1" /> Member Pricing
            </span>
          </div>

          {/* Price */}
          <div className="text-center mb-6">
            <h3 className="text-[20px] md:text-[36px] font-extrabold text-white">
              ONLY $37/MONTH
            </h3>
            <p className="text-gray-400 text-sm mt-1">Billed Monthly</p>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-center max-w-xl mx-auto mb-6">
            Start as an Apprentice and unlock monthly content with immediate
            access to Digital Launchpad&apos;s key programs and exclusive bonuses.
          </p>

          <hr className="border-gray-700 my-6" />

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              "Unlock All Business Strategies",
              "New Program Releases",
              "Levelling System",
              "Unlockable Content",
              "Monthly Rewards",
              "Monk Mode Tracker",
              "Exclusive Network of Achievers",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Button */}
          <div className="text-center">
           <Btn/>
            <p className="text-gray-500 text-xs mt-2">
              You&apos;ll get redirected to the Digital Launchpad platform to complete your enrolment.
            </p>
          </div>

          {/* Payment logos */}
          <div className="flex justify-center gap-6 mt-6 text-gray-300">
            <img src={pay} alt="pricing"
            className="w-24 h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
