import React, { useState, useEffect } from 'react';
import Splash from './pages/Splash';
import VerificationSystem from './pages/SendEmail';
import ProfileCompletion from './pages/CompleteRegister';

const App = () => {
  const [currentPage, setCurrentPage] = useState('splash');
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate checking authentication
      setIsLoading(true);

      try {
        // Check if user is already verified and has a profile
        const userData = localStorage.getItem('marsogramUser');
        const verifiedEmail = localStorage.getItem('marsogramVerified');

        setTimeout(() => {
          // If user has completed profile
          if (userData) {
            setCurrentPage('home'); // Would go to your app's home screen
          }
          // If user is verified but hasn't completed profile
          else if (verifiedEmail) {
            setCurrentPage('profile');
          }
          // If user has started the process but not verified
          else if (localStorage.getItem('marsogramEmail')) {
            setCurrentPage('verification');
          }
          // First time or logged out user
          else {
            setCurrentPage('splash');
          }

          setIsLoading(false);
        }, 1500); // Simulate network delay
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentPage('splash');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Navigation handlers
  const goToVerification = () => setCurrentPage('verification');
  const goToProfile = () => setCurrentPage('profile');
  const goToHome = () => setCurrentPage('home');

  // Handler for when verification is complete
  const handleVerificationComplete = (email) => {
    localStorage.setItem('marsogramVerified', email);
    goToProfile();
  };

  // Handler for when profile is complete
  const handleProfileComplete = (userData) => {
    localStorage.setItem('marsogramUser', JSON.stringify(userData));
    goToHome();
  };

  // Display appropriate page based on state
  const renderPage = () => {
    if (isLoading) {
      // You could show a loading spinner here
      return <Splash />;
    }

    switch (currentPage) {
      case 'splash':
        return <Splash onGetStarted={goToVerification} />;
      case 'verification':
        return <VerificationSystem onComplete={handleVerificationComplete} />;
      case 'profile':
        return <ProfileCompletion onComplete={handleProfileComplete} />;
      case 'home':
        return <div className="flex items-center justify-center h-screen bg-purple-100">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-2xl font-bold text-purple-600 mb-4">Welcome to Marsogram!</h1>
            <p>You've successfully registered and completed your profile.</p>
            <button
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg"
              onClick={() => {
                // Clear auth data and go to splash
                localStorage.removeItem('marsogramUser');
                localStorage.removeItem('marsogramVerified');
                localStorage.removeItem('marsogramEmail');
                setCurrentPage('splash');
              }}
            >
              Logout
            </button>
          </div>
        </div>;
      default:
        return <Splash onGetStarted={goToVerification} />;
    }
  };

  return (
    <div className="min-h-screen bg-purple-100">
      {renderPage()}
    </div>
  );
};

export default App;