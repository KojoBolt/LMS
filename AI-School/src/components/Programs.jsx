import React from "react";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";

const programs = [
  {
    id: "digital-launchpad",
    image:
      "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    logoText: "DIGITAL LAUNCHPAD",
    textColor: "text-white",
    gradientColor: "from-red-700/80 to-transparent",
    title: "Digital Launchpad",
    author: "Iman Gadzhi",
  },
  {
    id: "digital-launchpad",
    image:
      "https://img.freepik.com/free-photo/smiling-man-with-microphone-perform-stand-up_176420-17970.jpg?uid=R160851296&ga=GA1.1.1292176217.1739379214&semt=ais_hybrid&w=740",
    logoText: "THE WINNING STORE",
    textColor: "text-white",
    gradientColor: "from-purple-700/80 to-transparent",
    title: "The Winning Store",
    author: "Jordan Welch",
  },
  {
    id: "digital-launchpad",
    image:
      "https://img.freepik.com/free-photo/young-woman-road_181624-49097.jpg?uid=R160851296&ga=GA1.1.1292176217.1739379214&semt=ais_hybrid&w=740",
    logoText: "PATHWAY TO PROFITS",
    textColor: "text-white",
    gradientColor: "from-green-600/80 to-transparent",
    title: "Pathway to Profits",
    author: "Waqar Asim",
  },
  {
    id: "digital-launchpad",
    image:
      "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    logoText: "DIGITAL LAUNCHPAD",
    textColor: "text-white",
    gradientColor: "from-red-700/80 to-transparent",
    title: "Digital Launchpad",
    author: "Iman Gadzhi",
  },
  {
    id: "digital-launchpad",
    image:
      "https://img.freepik.com/free-photo/smiling-man-with-microphone-perform-stand-up_176420-17970.jpg?uid=R160851296&ga=GA1.1.1292176217.1739379214&semt=ais_hybrid&w=740",
    logoText: "THE WINNING STORE",
    textColor: "text-white",
    gradientColor: "from-purple-700/80 to-transparent",
    title: "The Winning Store",
    author: "Jordan Welch",
  },
  {
    id: "digital-launchpad",
    image:
      "https://img.freepik.com/free-photo/young-woman-road_181624-49097.jpg?uid=R160851296&ga=GA1.1.1292176217.1739379214&semt=ais_hybrid&w=740",
    logoText: "PATHWAY TO PROFITS",
    textColor: "text-white",
    gradientColor: "from-green-600/80 to-transparent",
    title: "Pathway to Profits",
    author: "Waqar Asim",
  },

 
];

const Programs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-bl from-black to-[#000648] px-3 py-3 text-white">
        <NavBar/>
        <div className="bg-[#161616] p-4 rounded-[12px] w-[40%] md:w-[20%] lg:w-[10%]  flex items-center m-auto mb-4 border-6 border-[#242424] ">
          <h1 className=" m-auto font-bold text-center">Our Programs</h1>
        </div>

    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 md:max-w-7xl mx-auto cursor-pointer">
  {programs.map((program, index) => (
    <Link key={program.id} to={`/programs/${program.id}`}>
      <div className="flex flex-col gap-2">
        {/* Image Section */}
        <div className="relative h-58 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={program.image}
            alt={program.title}
            className="w-full h-full object-cover"
          />
          <div
            className={`absolute inset-0 bg-gradient-to-t ${program.gradientColor}`}
          ></div>
          <div className="absolute bottom-4 left-4 text-lg font-bold">
            {program.logoText}
          </div>
        </div>

        {/* Text Section */}
        <div className="pl-1">
          <div className="text-sm font-semibold">{program.title}</div>
          <div className="text-xs text-white/60">{program.author}</div>
        </div>
      </div>
    </Link>
  ))}
</div>

    </div>
  );
};

export default Programs;
