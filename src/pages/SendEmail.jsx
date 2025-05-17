import React, { useState, useEffect, useRef } from 'react';

const VerificationSystem = ({ onComplete }) => {
    // Step state: 1=Email input, 2=Code verification
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);

    // Load email from localStorage on component mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('marsogramEmail');
        if (savedEmail) {
            setEmail(savedEmail);
        }
    }, []);

    // Handle focus to next input field when typing verification code
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    const handleCodeChange = (index, value) => {
        if (value.length > 1) {
            value = value.charAt(0);
        }
        
        // Only allow numbers
        if (value !== '' && !/^[0-9]$/.test(value)) {
            return;
        }

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus to next input if current input is filled
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace - if empty, move to previous input
        if (e.key === 'Backspace' && index > 0 && code[index] === '') {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('https://marsogramm-back-5.onrender.com/api/auth/send-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: email }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save email to localStorage
                localStorage.setItem('marsogramEmail', email);
                
                setMessage('Verification code sent to your email!');
                setMessageType('success');
                
                // Move to verification step
                setTimeout(() => {
                    setStep(2);
                    // Focus first code input
                    if (inputRefs.current[0]) {
                        inputRefs.current[0].focus();
                    }
                }, 1500);
            } else {
                setMessage(data.message || 'Failed to send verification code');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        // Check if code is complete
        if (code.some(digit => digit === '')) {
            setMessage('Please enter the complete 6-digit code');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const fullCode = code.join('');
            const response = await fetch('https://marsogramm-back-5.onrender.com/api/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username: email,
                    code: fullCode
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Successfully verified!');
                setMessageType('success');
                
                // Update UI to show all code inputs as green
                const boxes = document.querySelectorAll('.code-input');
                boxes.forEach(box => {
                    box.classList.add('verified');
                });
                
                // Call onComplete callback if provided
                if (onComplete && typeof onComplete === 'function') {
                    setTimeout(() => {
                        onComplete(email);
                    }, 1500);
                }
            } else {
                setMessage(data.message || 'Verification failed');
                setMessageType('error');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    const goToLogin = () => {
        setStep(1);
        setCode(['', '', '', '', '', '']);
        setMessage('');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-purple-100 px-4 py-6 sm:px-6">
            <div className="w-full max-w-md">
                <p className="text-gray-500 text-xs sm:text-sm mb-2 ml-1">login pages</p>

                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                    {/* Header with Marsogram title */}
                    <div className="bg-purple-500 pt-6 pb-16 px-8 relative">
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

                    <div className="px-6 sm:px-8 pt-4 sm:pt-6 pb-6 sm:pb-8">
                        <h2 className="text-xl font-medium mb-6 text-center">Login On Your Account</h2>

                        {/* Tabs navigation */}
                        <div className="flex mb-6 border-b">
                            <div 
                                className={`w-1/2 pb-2 text-center ${step === 1 ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
                                onClick={goToLogin}
                            >
                                <div className="flex items-center justify-center mx-auto cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                                    </svg>
                                    Login
                                </div>
                            </div>
                            <div 
                                className={`w-1/2 pb-2 text-center ${step === 2 ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}
                            >
                                <div className="flex items-center justify-center mx-auto">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Verification
                                </div>
                            </div>
                        </div>

                        {/* Step 1: Email Input */}
                        {step === 1 && (
                            <div>
                                <form onSubmit={handleSendCode}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-medium mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {message && (
                                        <div className={`p-3 rounded-lg mb-4 ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {message}
                                        </div>
                                    )}

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
                                                Sending...
                                            </span>
                                        ) : 'Send Verification Code'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Verification Code Input */}
                        {step === 2 && (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Enter Verification Code
                                    </label>
                                    <p className="text-gray-500 text-xs mb-4">
                                        A verification code has been sent to {email}
                                    </p>
                                    
                                    <div className="flex justify-between mb-4">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <input
                                                key={index}
                                                ref={el => inputRefs.current[index] = el}
                                                type="text"
                                                className="code-input w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-colors"
                                                maxLength={1}
                                                value={code[index]}
                                                onChange={(e) => handleCodeChange(index, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(index, e)}
                                                inputMode="numeric"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {message && (
                                    <div className={`p-3 rounded-lg mb-4 ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {message}
                                    </div>
                                )}

                                <button
                                    onClick={handleVerifyCode}
                                    className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </span>
                                    ) : 'Verify Code'}
                                </button>
                            </div>
                        )}

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-600">Don't Have Account?</span>
                            <a href="#" className="text-purple-600 font-medium ml-1">SignIn</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add CSS for verified inputs */}
            <style>
                {`
                .code-input.verified {
                    border-color: #10B981;
                    background-color: rgba(16, 185, 129, 0.1);
                }
                `}
            </style>
        </div>
    );
};

export default VerificationSystem;