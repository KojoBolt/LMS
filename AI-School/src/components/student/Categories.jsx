import React from "react";
import { Shapes, Video, Landmark, ChartNoAxesCombined, CircleDollarSign, ChartColumnBig, SquareChartGantt, SquareArrowDown } from 'lucide-react';

const topics = [
  { label: "General", icon:<Shapes className="text-gray-500" /> },
  { label: "Coding", icon: "💻" },
  { label: "Marketing", icon: "📢" },
  { label: "Content creator", icon: <Video className="text-red-500" /> },
  { label: "Educator", icon: "🎓" },
  { label: "Business operations", icon: <Landmark className="text-blue-500" /> },
  { label: "Sales", icon: <ChartNoAxesCombined className="text-green-600" /> },
  { label: "Finance", icon: <CircleDollarSign className="text-emerald-500" /> },
  { label: "Consulting", icon: "💡👥" },
  { label: "Data analysis", icon: <ChartColumnBig className="text-purple-500" /> },
  { label: "Project management", icon: <SquareChartGantt className="text-yellow-500" /> },
  { label: "Others", icon: <SquareArrowDown className="text-gray-400" /> },
];

const Categories = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">All topics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {topics.map((topic, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 border border-gray-300 rounded-lg p-3 hover:shadow-md transition"
          >
            <div className="text-2xl">{topic.icon}</div>
            <div className="text-sm font-medium text-gray-800">{topic.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
