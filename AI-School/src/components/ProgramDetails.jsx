import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import programs from './programsData'; 
import NavBar from './NavBar';
import HeroCard from "./HeroCard";


const ChevronIcon = ({ isOpen }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const SectionHeader = ({ title }) => (
  <div className="mb-6">
    <h2 className="text-4xl font-semibold tracking-[0.2em] text-white uppercase mb-3">{title}</h2>
    <div className="w-16 h-px bg-gray-700"></div>
  </div>
);


const ProgramDetails = () => {
  const { id } = useParams();
  const program = programs.find((p) => p.id === id);
  const [openAccordion, setOpenAccordion] = useState(null);

  if (!program) return <div className="text-white p-10">Program not found.</div>;

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="bg-gradient-to-bl from-black to-[#000648] text-gray-300 font-sans min-h-screen w-full flex justify-center py-20 px-4">
        <div className="fixed top-0 w-full z-50 ">
        <NavBar />
      </div>
      <div className="max-w-6xl w-full mt-[65px]">

        {/* Summary Section */}
        <section className="mb-14">
          <SectionHeader title="Summary" />
          <div className="space-y-4 text-base font-light leading-relaxed">
            {program.summary.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section className="mb-14">
          <SectionHeader title="Skills" />
          <div className="space-y-3">
            {program.skills.map((skill, i) => (
              <p key={i} className="text-3xl font-medium text-gray-100">{skill}</p>
            ))}
          </div>
        </section>

        {/* Curriculum Section (Accordion) */}
        <section className="mb-14">
          <SectionHeader title="Curriculum" />
          <div className="space-y-2">
            {program.curriculum.map((item, index) => (
              <div key={index} className="bg-[#1a1a1c] rounded-lg">
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex justify-between items-center p-5 text-left"
                >
                  <span className="text-white font-medium text-base">{item.title}</span>
                  <ChevronIcon isOpen={openAccordion === index} />
                </button>
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    openAccordion === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="p-5 pt-0 border-t border-gray-700">
                      <p className="text-gray-300 font-light">{item.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Instructor Section */}
        <section className="mb-14">
          <SectionHeader title="Instructor" />
          <div>
            <div className="mb-6 overflow-hidden rounded-xl shadow-lg">
              <img 
                src={program.instructor.image} 
                alt={program.instructor.name} 
                className="w-full h-auto object-cover" 
              />
            </div>
            <h3 className="text-4xl font-bold text-white mb-4">
              {program.instructor.name}
            </h3>
            <p className="text-base font-light leading-relaxed text-gray-300">
              {program.instructor.bio.map((para, index) => (
  <p
    key={index}
    className="text-base font-light leading-relaxed text-gray-300 mb-4"
  >
    {para}
  </p>
))}
            </p>
          </div>
          <div className='mt-[60px]'>
        <HeroCard/>
      </div>
        </section>
      </div>
    </div>
  );
};

export default ProgramDetails;
