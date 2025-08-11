import React from "react";
import "../../carousel.css"; // we'll add custom animations here
import Btn from "./Btn";

const TestimonialsCarousel = () => {
  const cards = [
    {
      title: "First client $3,000/month x18months",
      user: "fernandohamon",
      text: "I signed my first client after a week of actually applying the sale script and a correct structure.",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfcmDfPMAgKeVWpouurrtZaqFzA-lxJiJWRQ&s", // example image path
    },
    {
      title: "2 clients closed in first 2 days",
      user: "David Winick",
      text: "I started 3 days ago, in first 2 days I closed 2 clients...",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfcmDfPMAgKeVWpouurrtZaqFzA-lxJiJWRQ&s",
    },
    {
      title: "First 3K Deal Closed",
      user: "Joshua Flores",
      text: "Wow seriously no words!!",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfcmDfPMAgKeVWpouurrtZaqFzA-lxJiJWRQ&s",
    },
    {
      title: "My first €1000 in my first month here",
      user: "Anaas Bahada",
      text: "We did it boys, special thanks to everyone...",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfcmDfPMAgKeVWpouurrtZaqFzA-lxJiJWRQ&s",
    },
  ];

  return (
    <div className="text-white py-16 overflow-hidden max-w-[1200px] mx-auto">
      <h2 className="text-center text-3xl font-bold mb-10">
        EMPOWERING <span className="text-orange-500">30K+</span> USERS TOWARD REAL SUCCESS
      </h2>

      {/* Top Row */}
      <div className="carousel-row hover:paused animate-left">
        {[...cards, ...cards].map((card, i) => (
          <div
            key={i}
            className="bg-[#111] min-w-[300px] max-w-[300px] p-4 rounded-xl flex-shrink-0"
          >
            {card.img && (
              <img
                src={card.img}
                alt={card.title}
                className="rounded-lg mb-3 w-full h-40 object-cover"
              />
            )}
            <h3 className="font-bold mb-2">{card.title}</h3>
            <p className="text-sm mb-2 text-gray-400">@{card.user}</p>
            <p className="text-sm">{card.text}</p>
          </div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="carousel-row hover:paused animate-right mt-8">
        {[...cards, ...cards].map((card, i) => (
          <div
            key={i}
            className="bg-[#111] min-w-[300px] max-w-[300px] p-4 rounded-xl flex-shrink-0"
          >
            {card.img && (
              <img
                src={card.img}
                alt={card.title}
                className="rounded-lg mb-3 w-full h-40 object-cover"
              />
            )}
            <h3 className="font-bold mb-2">{card.title}</h3>
            <p className="text-sm mb-2 text-gray-400">@{card.user}</p>
            <p className="text-sm">{card.text}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[16px] text-center mt-[60px] text-gray-200">
            You don't just learn invaluable life lessons; you're joining a
            network of <br/>30K+ like-minded individuals all building their online careers.
        </p>
      </div>
      <Btn/>
    </div>
  );
};

export default TestimonialsCarousel;
