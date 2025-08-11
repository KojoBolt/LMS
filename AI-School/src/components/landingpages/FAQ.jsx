import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ = () => {
  const [activeTab, setActiveTab] = useState("General");
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const faqData = {
    General: [
      {
        id: 1,
        question: "What is Digital Launchpad?",
        answer: "Digital Launchpad is a comprehensive program designed to help individuals develop digital skills and launch their careers in the tech industry. It provides structured learning paths, mentorship, and practical projects to build your portfolio."
      },
      {
        id: 2,
        question: "How long will I have access to Digital Launchpad?",
        answer: "You'll have lifetime access to Digital Launchpad once you enroll. This includes all current content, future updates, and community access to ensure you can continue learning at your own pace."
      },
      {
        id: 3,
        question: "How can I unlock content and rewards faster?",
        answer: "You can unlock content faster by completing assignments on time, participating in community discussions, attending live sessions, and maintaining consistent progress through the modules. Active engagement helps accelerate your learning journey."
      }
    ],
    Pricing: [
      {
        id: 4,
        question: "What are the pricing options available?",
        answer: "We offer flexible pricing plans including monthly subscriptions starting at $99/month, quarterly plans with 15% discount, and annual plans with 30% savings. We also provide payment plans for those who need them."
      },
      {
        id: 5,
        question: "Is there a free trial available?",
        answer: "Yes! We offer a 14-day free trial that gives you access to introductory modules and community features. No credit card required to start your trial."
      },
      {
        id: 6,
        question: "What's included in the premium plan?",
        answer: "Premium plan includes all course content, 1-on-1 mentorship sessions, career coaching, portfolio reviews, job placement assistance, and access to our exclusive alumni network."
      }
    ],
    Program: [
      {
        id: 7,
        question: "Are there new programs released frequently?",
        answer: "Yes, we release new specialized programs every quarter based on industry trends and student feedback. Current students get access to new programs at no additional cost."
      },
      {
        id: 8,
        question: "Will this work for college students or full-time employees?",
        answer: "Absolutely! Our program is designed to be flexible for both college students and working professionals. With self-paced learning and evening/weekend live sessions, you can balance your studies or career while advancing your digital skills."
      },
      {
        id: 9,
        question: "What programming languages are covered?",
        answer: "Our program covers modern web technologies including HTML, CSS, JavaScript, React, Node.js, Python, and database management. We focus on the most in-demand skills in today's job market."
      }
    ]
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_rgba(139,0,0,0.6)_0%,_transparent_70%)] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[#BD290E] font-semibold text-sm uppercase tracking-wider mb-4">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <h1 className="text-[36px] font-bold mb-8">
            GET YOUR QUESTIONS ANSWERED
          </h1>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          {Object.keys(faqData).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setExpandedQuestion(null); // Reset expanded question when switching tabs
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 grid ${
                activeTab === tab
                  ? "bg-[#BD290E] text-white"
                  : "border-2 border-[#BD290E] text-white hover:bg-[#BD290E] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FAQ Questions */}
        <div className="space-y-4">
          {faqData[activeTab].map((faq) => (
            <div
              key={faq.id}
              className="border-b border-gray-700 pb-4"
            >
              <button
                onClick={() => toggleQuestion(faq.id)}
                className="w-full flex justify-between items-center text-left py-4 hover:text-[#BD290E] transition-colors duration-200"
              >
                <h3 className="text-xl font-medium pr-8">
                  {faq.question}
                </h3>
                <div className="text-[#BD290E] flex-shrink-0">
                  {expandedQuestion === faq.id ? (
                    <Minus size={24} />
                  ) : (
                    <Plus size={24} />
                  )}
                </div>
              </button>
              
              {expandedQuestion === faq.id && (
                <div className="pb-4 pr-8 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;