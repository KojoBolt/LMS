import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminMobileHeader = () => {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm p-4 z-40 overflow-x-hidden">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="text-xl font-bold">
          <span className="text-gray-800">AI-Skul</span>
          <span className="text-purple-600"> Admin</span>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <Search size={22} className="text-gray-600" />
          <div className="relative">
            <Bell size={22} className="text-gray-600" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <Link to="/admin/profile">
            <User size={22} className="text-gray-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminMobileHeader;
