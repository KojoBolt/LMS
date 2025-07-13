import React, {useState} from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/logoai.png'; 


function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex justify-between items-center px-8 py-4 rounded-2xl text-white mt-2 sticky top-0 z-50 ">
      {/* Logo */}
      {/* <div className="text-2xl font-extrabold tracking-wide">EDUCATE</div> */}
      <div>
      <img src={Logo} alt="" className='w-30 h-30' />
      </div>

      {/* Navigation Menu */}
      
     <ul className="gap-x-6 text-sm font-medium bg-[#49658C]/50 px-4 py-3 rounded-xl hidden md:flex">
        <li className="bg-[#1e2a3a] px-5 py-3 rounded-xl">
          <Link to="/">Home</Link>
        </li>
        <li className="hover:text-white/80 px-4 py-2 transition">
          <Link to="/programs">Programs</Link>
        </li>
        <li className="hover:text-white/80 px-4 py-2 transition">
          <Link to="/mission">Our Mission</Link>
        </li>
        <li className="hover:text-white/80 px-4 py-2 transition">
          <Link to="/career">Career</Link>
        </li>
        <li className="hover:text-white/80 px-4 py-2 transition">
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
          <a href="#"><li className="bg-[#1e2a3a] px-5 py-3 rounded-xl">Home</li></a>
          <li className="hover:text-white/80 px-4 py-2 transition"><a href="/programs">Programs</a></li>
          <li className="hover:text-white/80 px-4 py-2 transition"><a href="/mission">Our Mission</a></li>
          <li className="hover:text-white/80 px-4 py-2 transition"><a href="/career">Career</a></li>
          <li className="hover:text-white/80 px-4 py-2 transition"><a href="/register">Student Login</a></li>
        </ul>
      )}
      </div>
  );
}

export default NavBar;
