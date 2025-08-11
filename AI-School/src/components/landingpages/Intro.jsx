const Intro = () => {
  return (
    <div className="min-h-screen px-6 py-12 ">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <p className="text-white text-lg md:text-xl lg:text-2xl leading-relaxed font-light">
          Digital Launchpad isn't just a learning platform—it's a launchpad for your online business journey. Get access to a 
          curated selection of proven business models, specifically{' '}
          <span className="bg-[#FB440A] text-white px-2 py-1 rounded">
            tailored for beginners
          </span>
          . Discover how to choose the right 
          career path based on your personality, and master strategies to{' '}
          <span className="bg-[#FB440A] text-white px-2 py-1 rounded">
            build a profitable business
          </span>
          {' '}while balancing other 
          commitments. Stay ahead by learning how to capitalize on emerging trends before they go mainstream, and fast-
          track your path to generating online income with guidance from{' '}
          <span className="bg-[#FB440A] text-white px-2 py-1 rounded">
            experts who've done it before
          </span>
          .
        </p>
      </div>

      {/* Who Is It For Section */}
      <div className="max-w-7xl mx-auto mt-[190px]">
        <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12">
          WHO IS DIGITAL LAUNCHPAD FOR?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Beginners */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-[#FB440A] text-xl font-bold mb-3">BEGINNERS</h3>
            <p className="text-white text-sm leading-relaxed">
              Jumpstart your journey with step-by-step guidance, practical resources, and supportive community.
            </p>
          </div>

          {/* Professionals */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-[#FB440A] text-xl font-bold mb-3">PROFESSIONALS</h3>
            <p className="text-white text-sm leading-relaxed">
              Learn how to launch a profitable online business while keeping your full-time job.
            </p>
          </div>

          {/* Entrepreneurs */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-[#FB440A] text-xl font-bold mb-3">ENTREPRENEURS</h3>
            <p className="text-white text-sm leading-relaxed">
              Expand your toolkit with insights and tactics from experts who have been where you are.
            </p>
          </div>

          {/* Business Owners */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-[#FB440A] text-xl font-bold mb-3">BUSINESS OWNERS</h3>
            <p className="text-white text-sm leading-relaxed">
              Modernize your approach and find new ways to scale and optimize your existing business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Intro;