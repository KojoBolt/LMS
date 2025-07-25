import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminLogo from '../../assets/images/logoblack.png';

const InstructorMobileHeader = () => {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm p-4 z-40 overflow-x-hidden">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold">
          <img src={AdminLogo} alt="Ai-School" className='w-20 h-11'/>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          {/* <Search size={22} className="text-gray-600" /> */}
          {/* <div className="relative">
            <Bell size={22} className="text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </div> */}
          <Link to="/instructor/profile">
            <User size={22} className="text-gray-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InstructorMobileHeader;
