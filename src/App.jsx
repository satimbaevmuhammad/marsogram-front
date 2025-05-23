import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Splash from './pages/Splash';
import VerificationSystem from './pages/SendEmail';
import ProfileCompletion from './pages/CompleteRegister';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import About from './pages/About';
import Settings from './pages/Settings';
import NotFoundPage from './pages/NotfoundPage';

// Splash screen wrapper that shows splash for a specified time then redirects
const SplashWrapper = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // First show splash screen with full opacity
    setShowSplash(true);

    // After 2 seconds, check auth and redirect
    const timer = setTimeout(() => {
      const userData = localStorage.getItem('marsogramUser');
      const verifiedEmail = localStorage.getItem('marsogramVerified');

      // Navigate based on auth state
      if (userData) {
        navigate('/dashboard');
      } else if (verifiedEmail) {
        navigate('/profile');
      } else {
        navigate('/verification');
      }

      setShowSplash(false);
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return <Splash />;
};

// Protected Route component
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('marsogramUser') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/verification" replace />;
  }

  return element;
};

// Handler for verification completion
const VerificationWrapper = () => {
  const navigate = useNavigate();

  const handleVerificationComplete = (email) => {
    // Save verified status and isauth flag to localStorage
    localStorage.setItem('marsogramVerified', email);
    localStorage.setItem('marsogramIsAuth', 'true');
    navigate('/profile');
  };

  return <VerificationSystem onComplete={handleVerificationComplete} />;
};

// Handler for profile completion
const ProfileWrapper = () => {
  const navigate = useNavigate();

  const handleProfileComplete = (userData) => {
    localStorage.setItem('marsogramUser', JSON.stringify(userData));

    // Direct redirect to dashboard
    navigate('/dashboard');
  };

  return <ProfileCompletion onComplete={handleProfileComplete} />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Root path shows splash screen and then redirects */}
        <Route path="/" element={<SplashWrapper />} />

        {/* Verification screen */}
        <Route path="/verification" element={<VerificationWrapper />} />

        {/* Profile completion screen */}
        <Route path="/profile" element={<ProfileWrapper />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/chats" element={<ProtectedRoute element={<ChatPage />} />} />
        <Route path="/about" element={<ProtectedRoute element={<About />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />

        {/* 404 Not Found page for invalid routes */}
        <Route path="/404" element={<NotFoundPage />} />

        {/* Catch all unknown routes and redirect to 404 page */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
};

export default App;