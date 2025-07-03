import React from 'react'
import { Outlet } from 'react-router-dom'
// import NavBar from '../NavBar'

const PublicLayout = () => {
  return (
    <div>
      {/* <NavBar /> */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout