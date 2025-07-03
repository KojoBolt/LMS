import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSideBar from '../admin/AdminSideBar'

const AdminLayout = () => {
  return (
    <div className="flex ">
       <AdminSideBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout