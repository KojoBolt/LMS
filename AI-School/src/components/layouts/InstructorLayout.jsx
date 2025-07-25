import React from 'react'
import { Outlet } from 'react-router-dom';
import InstructorSidebar from '../instructor/InstructorSidebar';
import InstructorMobileHeader from '../instructor/InstructorMobileHeader';
import InstructorMobileFooter from '../instructor/InstructorMobileFooter';
import InstructorDashboard from '../instructor/InstructorDashboard';

const InstructorLayout = () => {
  return (
    <div className="flex ">
      <InstructorMobileHeader/>
      <InstructorMobileFooter />

       <InstructorSidebar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default InstructorLayout;