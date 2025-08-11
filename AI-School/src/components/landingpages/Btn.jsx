import React from 'react'
import { Link } from 'react-router-dom';

function Btn() {
  return (
    <div className='flex flex-col items-center justify-center gap-4 text-white mt-12'>
        <Link className='bg-gradient-to-br from-[#B31E16] to-[#C53209] px-6 py-3 rounded hover:bg-gradient-to-bl hover:from-[#C53209] hover:to-[#B31E16]'>YES! GIVE ME ACCESS</Link>
        <p className='text-gray-500 text-[13px]'>Secure your access today and start your journey.</p>
    </div>
  )
}

export default Btn;