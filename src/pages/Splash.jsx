import React from 'react'
import Logo from '../assets/logo.jpg'
const Splash = () => {
    return (
        <div className='flex justify-center items-center w-full h-[100vh]'>
            <img className='w-[40%] max-[500px]:w-[90%]' src={Logo} alt="" />
        </div>
    )
}

export default Splash