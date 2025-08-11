import React from 'react'
import Btn from './Btn';

function PayNow() {
  return (
    <div className='flex flex-col items-center justify-center gap-4 text-white mt-12 bg-black py-16 px-6'>
        <h2 className='text-2xl md:text-4xl font-bold text-center uppercase'>
            Sign up <><span className='text-[#FB440A]'>today</span> to take your first steps <br/>towards a new life <span className='text-[#FB440A]'>tomorrow</span></>
        </h2>
        <p className='text-lg md:text-[16px] text-center max-w-3xl pt-14'>Don’t wait to start building the life you’ve always dreamed of. With Digital Launchpad, you’ll gain the skills, support, and resources needed to transform your future. Whether you’re looking to boost your income, launch a new business, or master high-demand skills, your journey starts here.</p>
        <Btn/>
    </div>
  )
}

export default PayNow;