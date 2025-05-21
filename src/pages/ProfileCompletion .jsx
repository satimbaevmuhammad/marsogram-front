import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileCompletion = ({ onComplete }) => {
    const navigate = useNavigate(); // React Router hook для перенаправления
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const fileInputRef = useRef(null);

    // Load email from localStorage on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('marsogramEmail');
        if (savedEmail) {
            setUsername(savedEmail);
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);

            // Create a preview URL
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Clean up preview URL when component unmounts
            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setMessage('Please enter your full name');
            setMessageType('error');
            return;
        }

        if (!avatar) {
            setMessage('Please upload a profile picture');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Create FormData for file upload
            const formData = new FormData();
            formData.append('username', username);
            formData.append('name', fullName);
            formData.append('phoneNumber', phoneNumber);
            formData.append('avatar', avatar);

            // First upload the image
            // Note: Your actual API might require a different approach
            // This is a typical formData upload pattern

            // Then complete the profile
            const response = await fetch('https://marsogramm-back-5.onrender.com/api/auth/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    name: fullName,
                    phoneNumber: phoneNumber,
                    avatar: previewUrl, // In a real app, this would be the URL returned from image upload
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Profile completed successfully!');
                setMessageType('success');

                // Save user data to localStorage
                const userData = {
                    username,
                    name: fullName,
                    phoneNumber,
                    avatar: previewUrl,
                };
                
                localStorage.setItem('marsogramUser', JSON.stringify(userData));
                
                // Показываем сообщение об успехе на короткое время
                setTimeout(() => {
                    // Прямое перенаправление на dashboard (без обновления страницы)
                    navigate('/dashboard');
                    
                    // Если используете onComplete пропс
                    if (onComplete && typeof onComplete === 'function') {
                        onComplete(userData);
                    }
                }, 1000); // Задержка 1 секунда, чтобы пользователь увидел сообщение об успехе
            } else {
                setMessage(data.message || 'Failed to complete profile');
                setMessageType('error');
            }
        } catch (error) {
            console.error("Profile completion error:", error);
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    // Функция для кнопки Next Step при успешном заполнении профиля
    const handleNextStep = () => {
        // Прямое перенаправление на dashboard
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 px-4 py-6 sm:px-6">
            <div className="w-full max-w-md">
                <p className="text-gray-500 text-xs sm:text-sm mb-2 ml-1">SignIn pages</p>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    {/* Header with Marsogram title and wave */}
                    <div className="bg-purple-500 pt-6 pb-24 px-8 relative">
                        <div className="text-center mb-2">
                            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-wide relative z-10">
                                Marsogram
                            </h1>
                        </div>
                        <div
                            className="absolute bottom-0 left-0 right-0 h-16 bg-white"
                            style={{ borderTopLeftRadius: '50%', borderTopRightRadius: '50%' }}
                        ></div>
                    </div>

                    {/* Profile picture on the wave */}
                    <div className="relative -mt-20 mb-4 flex justify-center">
                        <div
                            className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={triggerFileInput}
                        >
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-purple-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="px-6 sm:px-8 pt-0 pb-6 sm:pb-8">
                        <h2 className="text-xl font-medium mb-6 text-center">Complete Your Profile</h2>

                        {/* Tabs navigation */}
                        <div className="flex mb-6 border-b">
                            <div className="w-1/2 pb-2 text-center text-gray-500">
                                <div className="flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                                    </svg>
                                    Login
                                </div>
                            </div>
                            <div className="w-1/2 pb-2 border-b-2 border-purple-600 text-center text-purple-600">
                                <div className="flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Verification
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        type="text"
                                        placeholder="Enter full name..."
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <input
                                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        type="tel"
                                        placeholder="+XX XXX-XXX-XXXX"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-lg mb-4 ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {message}
                                </div>
                            )}

                            {/* If profile is already completed successfully, show different button behavior */}
                            {messageType === 'success' ? (
                                <button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </span>
                                    ) : 'Next Step'}
                                </button>
                            )}
                        </form>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-600">You Have Account?</span>
                            <a href="#" className="text-purple-600 font-medium ml-1">Login</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletion;