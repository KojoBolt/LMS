import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, MoreHorizontal } from 'lucide-react';

const adminMenuItems = [
    { icon: <LayoutDashboard size={24} />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <BookOpen size={24} />, label: "Add Courses", path: "/admin/courses" },
    { icon: <Users size={24} />, label: "Students", path: "/admin/enrollments" },
    { icon: <MoreHorizontal size={24} />, label: "More", path: "/admin/more" }, // Placeholder for more options
];

const AdminBottomNav = () => {
    const activeLinkStyle = "flex flex-col items-center text-purple-600";
    const inactiveLinkStyle = "flex flex-col items-center text-gray-500";

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-40 border-t border-gray-200 overflow-x-hidden">
            <div className="flex justify-around items-center p-2">
                {adminMenuItems.map((item, i) => (
                    <NavLink
                        key={i}
                        to={item.path}
                        className={({ isActive }) => (isActive ? activeLinkStyle : inactiveLinkStyle) + ' w-full text-center py-1'}
                    >
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default AdminBottomNav;
