import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../student/SideBar';

const StudentLayout = () => {
  // --- NEW: The search term state is now managed by the parent layout ---
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex">
      {/* Pass the handler function down to the SideBar */}
      <SideBar onSearchChange={setSearchTerm} />
      <main className="flex-1">
        {/* Pass the current search term down to the child route (e.g., Dashboard) */}
        {/* The 'context' prop from Outlet is how we pass data down */}
        <Outlet context={{ searchTerm }} />
      </main>
    </div>
  );
};

export default StudentLayout;
