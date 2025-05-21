import React, { useEffect, useState } from 'react';
import Logo from '../assets/logo.jpg';

const Splash = () => {
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        // Start fade-out effect after 1.5 seconds
        const fadeoutTimer = setTimeout(() => {
            setOpacity(0);
        }, 1500);

        return () => clearTimeout(fadeoutTimer);
    }, []);

    return (
        <div 
            className='flex justify-center items-center w-full h-[100vh] bg-purple-100'
            style={{ 
                opacity: opacity,
                transition: 'opacity 0.5s ease-out'
            }}
        >
            <img className='w-[40%] max-[500px]:w-[90%]' src={Logo} alt="Marsogram Logo" />
        </div>
    );
};

export default Splash;