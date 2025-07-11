import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../student/SideBar';
import BottomNav from '../student/BottomNav';
import MobileHeader from '../student/MobileHeader';

const StudentLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex">
      <MobileHeader/>
      <BottomNav/>
     
      <SideBar onSearchChange={setSearchTerm}/>
      <main className="flex-1">
       
        <Outlet context={{ searchTerm }} />
      </main>
    </div>
  );
};

export default StudentLayout;
