import React from 'react'
import { Outlet } from 'react-router-dom'
import AdminSideBar from '../admin/AdminSideBar'
import AdminMobileHeader from '../admin/AdminMobileHeader'
import AdminMobileFooter from '../admin/AdminMobileFooter'

const AdminLayout = () => {
  return (
    <div className="flex ">
      <AdminMobileHeader />
      <AdminMobileFooter />

       <AdminSideBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout