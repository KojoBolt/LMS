import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../student/SideBar'

const StudentLayout = () => {
  return (
    <div className="flex ">
      <SideBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default StudentLayout