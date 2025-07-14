import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/images/logoai.png';

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "bg-[#1e2a3a] px-5 py-3 rounded-xl"
      : "hover:text-white/80 px-4 py-2 transition";
  };

  return (
    <div className="flex justify-between items-center px-8 py-4 rounded-2xl text-white mt-2 sticky top-0 z-50 ">
      {/* Logo */}
      <div>
        <Link to={"/"}>
          <img src={Logo} alt="Logo" className='w-30 h-30' />
        </Link>
      </div>

      {/* Navigation Menu */}
      <ul className="gap-x-6 text-sm font-medium bg-[#49658C]/50 px-4 py-3 rounded-xl hidden md:flex">
        <li className={getLinkClass("/")}>
          <Link to="/">Home</Link>
        </li>
        <li className={getLinkClass("/programs")}>
          <Link to="/programs">Programs</Link>
        </li>
        <li className={getLinkClass("/mission")}>
          <Link to="/mission">Our Mission</Link>
        </li>
        <li className={getLinkClass("/career")}>
          <Link to="/career">Career</Link>
        </li>
        <li className={getLinkClass("/login")}>
          <Link to="/login">Student Login</Link>
        </li>
      </ul>

      {/* Hamburger Menu Icon */}
      <div className="bg-[#000]/60 p-3 rounded-full md:hidden ">
        {isMenuOpen ? (
          <CloseIcon className="text-white" onClick={() => setIsMenuOpen(false)} />
        ) : (
          <MenuIcon className="text-white" onClick={() => setIsMenuOpen(true)} />
        )}
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <ul className="absolute top-22 bg-[#49658C]/50 rounded-xl p-6 flex flex-col gap-y-4 md:hidden w-[90%]">
          <li className={getLinkClass("/")} onClick={() => setIsMenuOpen(false)}>
            <Link to="/">Home</Link>
          </li>
          <li className={getLinkClass("/programs")} onClick={() => setIsMenuOpen(false)}>
            <Link to="/programs">Programs</Link>
          </li>
          <li className={getLinkClass("/mission")} onClick={() => setIsMenuOpen(false)}>
            <Link to="/mission">Our Mission</Link>
          </li>
          <li className={getLinkClass("/career")} onClick={() => setIsMenuOpen(false)}>
            <Link to="/career">Career</Link>
          </li>
          <li className={getLinkClass("/login")} onClick={() => setIsMenuOpen(false)}>
            <Link to="/login">Student Login</Link>
          </li>
        </ul>
      )}
    </div>
  );
}

export default NavBar;