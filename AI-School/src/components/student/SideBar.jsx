import React from 'react'
import { Home, BookOpen, Compass, Calendar, Users, Gift, Bug, Bell, EllipsisVertical } from "lucide-react";
import { Link } from 'react-router-dom';

const menu = [
  { icon: <Home size={18} />, label: "Home", path: "/student/dashboard" },
  { icon: <BookOpen size={18} />, label: "Courses", path: "/student/courses" },
  { icon: <Compass size={18} />, label: "Guides", path: "/student/guides" },
  { icon: <Calendar size={18} />, label: "Workshops", path: "/student/workshops" },
  { icon: <Users size={18} />, label: "Events", path: "/student/events" },
  { icon: <Users size={18} />, label: "Community", path: "/student/community" },
  { icon: <Gift size={18} />, label: "Perks", path: "/student/perks" },
];

const SideBar = () => {
  return (
    <div className="bg-[#FAFAFA] fixed border border-r-[#E3E3E3] border-b-0 border-t-0 h-screen w-[300px] p-4 flex flex-col justify-between top-0 left-0 z-100 overflow-x-hidden">
      <div>
        <div className="text-xl font-bold mb-6 ">
          <span className="text-black">The Rundown</span>
          <span className="text-purple-600"> University</span>
        </div>
        <div>
            <input type="search" placeholder="Search..." className="border border-gray-300 bg-[#E9E9E9] rounded-md p-2 w-full" />
        </div>

        <div className="flex flex-col gap-4 p-4 mt-6">
          {menu.map((item, i) => (
              <Link
                key={i}
                to={item.path}
                className="flex items-center gap-3 text-[15px] text-gray-700 hover:text-black"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <div className="mb-2">
          <div className="flex items-center justify-between bg-[#E9E9E9] p-4 mb-9 rounded">
            <span>Get started</span>
            <span className="text-xs font-medium text-purple-600">67%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded mb-10">
            <div className="w-[67%] h-full bg-purple-600 rounded" />
          </div>
        </div>
        <button className="flex mb-10 text-[15px] text-gray-700 hover:underline">
          <Bug className='mr-1' size={18} />Report a problem
        </button>
      </div>
      <div className="flex items-center mt-6">
        <div className="flex items-center gap-3">
        <img src="https://img.freepik.com/free-photo/confident-business-woman-portrait-smiling-face_53876-137693.jpg?uid=R160851296&ga=GA1.1.1292176217.1739379214&semt=ais_hybrid&w=740" alt="" 
        className='w-[30px] h-[30px] rounded-2xl mr-[120px]' />
        <Bell /> <EllipsisVertical />

        </div>
      </div>
    </div>
  );
};

export default SideBar;