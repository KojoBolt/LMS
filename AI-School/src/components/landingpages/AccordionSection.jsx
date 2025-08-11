import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Btn from "./Btn";

const AccordionSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const data = [
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxctjU21pUENIsGN1F4qY21P7GfdEbhTMp2g&s",
      title: "THE WINNING STORE",
      category: "ECOMMERCE",
      description:
        "Unlock the potential of your e-commerce venture. Learn product selection, branding, sales tactics, and ad strategies to build a successful online store.",
      author: "Jordan Welch",
      duration: "8h",
      modules: 44,
    },
    {
      img: "https://media.istockphoto.com/id/1138155908/photo/close-up-beautiful-young-african-american-woman-smiling-outside.jpg?s=612x612&w=0&k=20&c=ksZlW_IM03tHzM54xM9BGLwwAEdeRzCYPFz0zRpnQcc=",
      title: "PEN TO PROFIT",
      category: "COPYWRITING",
      description:
        "Master the art of persuasive writing to drive sales, build brands, and create engaging content that converts.",
      author: "John Doe",
      duration: "6h",
      modules: 40,
    },
  ];

  const toggleAccordion = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
    console.log("Toggled:", index); // Debug to check click firing
  };

  return (
    <div className="bg-black text-white py-12">
      {/* Heading */}
      <div className="text-center mb-8">
        <h4 className="text-[#ff3b00] font-bold uppercase text-sm">
          Skills and Knowledge
        </h4>
        <h2 className="text-3xl md:text-4xl font-extrabold max-w-3xl mx-auto">
          ACCESS A CURATED SELECTION OF PROVEN ONLINE BUSINESS MODELS..
        </h2>
      </div>

      {/* Accordion */}
      <div className="max-w-4xl mx-auto flex flex-col gap-6 px-4">
        {data.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-gradient-to-r from-[#1a0d0a] to-[#0d0d0d] rounded-2xl p-4"
            >
              {/* Clickable Header */}
              <button
                type="button"
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between gap-4 text-left focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-[#ff3b00] uppercase text-xs font-semibold">
                      {item.category}
                    </p>
                  </div>
                </div>

                <div className="items-center gap-4 hidden md:flex">
                  <span className="text-sm font-bold">
                    {item.modules} MODULES
                  </span>
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
              </button>

              {/* Content */}
              {isOpen && (
                <div className="mt-4 pl-20">
                  <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                  <p className="text-sm font-semibold">
                    {item.author}{" "}
                    <span className="text-gray-400">
                      Duration: {item.duration}
                    </span>
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div>
        <Btn />
      </div>
    </div>
  );
};

export default AccordionSection;
