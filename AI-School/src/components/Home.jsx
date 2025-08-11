import React from "react";
import NavBar from "./NavBar";
import { useNavigate } from 'react-router-dom';
import CustomCarousel from "./CustomCarousel";



const programs = [
  {
    title: "DIGITAL LAUNCHPAD",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp", 
    // rotate: "-rotate-2",
    color: "bg-red-600/70",
  },
  {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
 {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
   {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
   {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
   {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
   {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
   {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
   {
    title: "LEARN TO PROFIT",
    image: "https://educate.io/images/6668ddbdef76280dc519f6fd_Digital-Launchpad-min-p-1080.webp",
    // rotate: "rotate-2",
    color: "bg-orange-600/70",
  },
  
];

const Home = () => {
    const navigate = useNavigate();

  return (
    <div className="lg:max-h-screen flex flex-col md:flex-row bg-gradient-to-bl from-black to-[#002786] text-white md:min-h-screen min-h-screen">
      <div className="fixed top-0 w-full z-50 ">
        <NavBar />
      </div>
  
      {/* LEFT */}
      <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center items-start p-10 mt-[300px] md:mt-0 lg:mt-0 2xl:mt-0">
        <h1 className="text-[26px] lg:text-[46px] md:mt-[250px] md:grid md:grid-cols-1 font-bold leading-tight lg:mt-[150px] mb-6 ">
          We’re Changing <br /> The Education System Forever.
        </h1>
        <p className="text-lg text-gray-400 mb-8 max-w-md">
          Practical education that gives you all the tools you need to thrive in the digital age.
        </p>
        <button 
        className="bg-white text-black lg:px-6 lg:py-3 px-4 py-3 rounded-xl font-semibold hover:bg-gray-200 transition cursor-pointer text-[13px]"
        onClick={() => navigate('/programs')}
        >
          SEE ALL PROGRAMS
        </button>
      </div>

      {/* Mobile Image Grid Background */}
<div
  className="absolute inset-0 z-0 block lg:hidden bg-cover bg-center"
  style={{ backgroundImage: 'url("https://educate.io/images/Banner-Pics-Tablet.webp")' }}
>
</div>
  {/* RIGHT */}

  <div className="relative w-full overflow-hidden p-4 bg-[#191819] gap-2 m-[10px] rounded-2xl group hidden md:overflow-hidden lg:block"> 
  {/* <div
    className="absolute w-full grid grid-cols-3 place-content-center gap-[2.35em] grid-rows-[auto] m-auto [transform:translate3d(0vw,0vw,0px)_scale3d(1,1,1)_rotateX(11deg)_rotateY(-11deg)_rotateZ(11deg)_skew(0deg,0deg)]
  [transform-style:preserve-3d]
  [will-change:transform] md:mt-0 lg:mt-0 2xl:mt-0"
    style={{ width: `${(programs.length / 3) * 100}%` }}
  >
    {programs.map((program, index) => (
      <div
        key={index}
        className={`hover:scale-110 relative overflow-hidden rounded-2xl aspect-[16/9] w-full mx-auto transform ${program.rotate}`}
      >
        <img
          src={program.image}
          alt={program.title}
          className="w-full h-full object-cover"
        />
        {/* <div
          className={`absolute bottom-0 left-0 right-0 px-4 py-3 ${program.color} text-white font-bold text-lg`}
        >
          {program.title}
        </div> */}
      {/* </div>
    ))}
  </div> */} 
  <CustomCarousel />
</div>
        

              
</div>
  );
};

export default Home;
