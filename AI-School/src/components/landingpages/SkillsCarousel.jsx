import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SkillsCarousel() {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
  };

  const cards = [
    {
      icon: "❤️",
      title: "HEALTH RESET",
      description:
        "Learn practical detox techniques to optimize your energy, health, and overall performance through natural methods.",
      footerLeft: "Detox 101, Module 4",
      footerRight: "18:22",
    },
    {
      icon: "⚡",
      title: "FOCUS AND PRODUCTIVITY UNLEASHED",
      description:
        "Dive into productivity hacks and routines that help you achieve laser focus, peak performance, and work-life balance.",
      footerLeft: "Digital Launchpad, Module 2",
      footerRight: "04:19",
    },
    {
      icon: "👑",
      title: "SMART TRADING BASICS",
      description:
        "Gain a solid understanding of market cycles and strategies to make informed investment decisions.",
      footerLeft: "Pathway to Profits, Module 1",
      footerRight: "12:55",
    },
    {
      icon: "👑",
      title: "SMART TRADING BASICS",
      description:
        "Gain a solid understanding of market cycles and strategies to make informed investment decisions.",
      footerLeft: "Pathway to Profits, Module 1",
      footerRight: "12:55",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-black via-[#1a0d0a] to-black py-10 text-white overflow-x-hidden w-full">
      {/* Heading */}
      <h2 className="text-center text-3xl font-bold mb-8">
        <span className="text-[#ff3b00]">ACQUIRE</span> THE SKILLS YOU NEED TO{" "}
        <span className="text-[#ff3b00]">SUCCEED</span>
      </h2>

      {/* Carousel Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Left Button */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 hover:bg-black"
        >
          <ChevronLeft className="text-white" />
        </button>

        {/* Scrollable Cards */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-12"
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 bg-[#1c1c1c] p-5 rounded-xl border border-[#ff3b00]/20"
            >
              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center bg-[#ff3b00]/20 rounded-full mb-4 text-lg">
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="font-bold text-lg mb-3">{card.title}</h3>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-6">{card.description}</p>

              {/* Footer */}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{card.footerLeft}</span>
                <span>{card.footerRight}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Button */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 hover:bg-black"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>
    </div>
  );
}
