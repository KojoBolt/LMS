import React from "react";
import { Shapes, Video, Landmark, ChartNoAxesCombined, CircleDollarSign, ChartColumnBig, SquareChartGantt, SquareArrowDown, HeartHandshake, BadgePoundSterling, Laptop, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const topics = [
  { label: "General", icon:<Shapes className="text-gray-500" /> },
  { label: "Coding", icon: <Laptop className="text-gray-500" /> },
  { label: "Marketing", icon: <BadgePoundSterling className="text-gray-500" /> },
  { label: "Content creator", icon: <Video className="text-red-500" /> },
  { label: "Educator", icon:  <GraduationCap className='text-green-700' /> },
  { label: "Business operations", icon: <Landmark className="text-blue-500" /> },
  { label: "Sales", icon: <ChartNoAxesCombined className="text-green-600" /> },
  { label: "Finance", icon: <CircleDollarSign className="text-emerald-500" /> },
  { label: "Consulting", icon: <HeartHandshake className="text-pink-500" /> },
  { label: "Data analysis", icon: <ChartColumnBig className="text-purple-500" /> },
  { label: "Project management", icon: <SquareChartGantt className="text-yellow-500" /> },
  { label: "Others", icon: <SquareArrowDown className="text-gray-400" /> },
];

const Categories = () => {
   const { theme } = useTheme();

  const textColor = theme === 'dark' ? 'text-white' : 'text-black';

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">All topics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {topics.map((topic, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 hover:shadow-md transition"
          >
            <div className="text-2xl">{topic.icon}</div>
            <div className={`text-sm font-medium ${textColor}`}>{topic.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
