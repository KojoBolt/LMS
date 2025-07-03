import React from "react";
import { Clock, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const workshops = [
  {
    title: "Getting Started with n8n: Build Your First Personal Assistant.",
    date: "Jun 20 (Fri) at 4:00 PM ET - 5:00 PM ET",
    category: "AI Agents",
    description: "Hosted by Dr. Alvaro Cintas",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    badgeColor: "bg-pink-600",
  },
  {
    title: "TBD - Depending on the latest AI developments during this week",
    date: "Jun 27 (Fri) at 4:00 PM ET - 5:00 PM ET",
    category: "General",
    description: "Hosted by Dr. Alvaro Cintas",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    badgeColor: "bg-gray-700",
  },
];

const Events = () => {
  return (
    <div className="p-8 max-w-7xl ml-[300px]">
      <h2 className="text-3xl font-bold mb-2">Upcoming workshops</h2>
      <p className="text-gray-600 mb-6">
        View our schedule of live events and register to participate in real-time workshop sessions.
      </p>

      <div className="flex items-center text-lg font-semibold mb-4">
        <Clock className="mr-2" />
        Next up
      </div>

      <div className="flex gap-4">
        {workshops.map((workshop, idx) => (
          <div key={idx} className="bg-[#FAFAFA] shadow-emerald-100 rounded-2xl border border-gray-300 h-[300px] w-[350px]">
            <div className="bg-black text-white p-4 rounded-t-2xl flex justify-between items-start">
              <div>
                <span className="text-xs bg-white text-black rounded-full px-2 py-0.5 font-medium">
                  {workshop.category}
                </span>
                <div className="mt-2 font-semibold leading-tight text-sm">
                  {workshop.title}
                </div>
                <p className="text-xs mt-1 text-gray-300">{workshop.description}</p>
              </div>
              <img
                src={workshop.image}
                alt="host"
                className="w-16 h-16 rounded-xl object-cover"
              />
            </div>

            <div className="p-4">
              <p className="font-semibold text-sm mb-1">{workshop.title}</p>
              <p className="text-sm text-gray-500 mb-4">{workshop.date}</p>
              <button className="w-full text-center border border-gray-300 rounded-xl cursor-pointer py-2 text-sm hover:bg-gray-50">
                Event Details & RSVP
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;
