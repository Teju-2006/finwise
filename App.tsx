import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup'; // New import
import CursorEffect from './components/CursorEffect'; // New import
import { authService } from './services/api';
import { UserProfile } from './types';

type AuthPage = 'login' | 'signup' | 'dashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AuthPage>('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('login');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleSignupSuccess = () => {
    setCurrentPage('dashboard'); // After successful signup, go to dashboard
  };

  const handleNavigateToSignup = () => {
    setCurrentPage('signup');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  if (isLoading) {
    return (
      <>
        <CursorEffect />
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-yellow-400 text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <CursorEffect /> {/* Render the CursorEffect globally */}
      {(() => {
        switch (currentPage) {
          case 'login':
            return <Login onLoginSuccess={handleLoginSuccess} onNavigateToSignup={handleNavigateToSignup} />;
          case 'signup':
            return <Signup onSignupSuccess={handleSignupSuccess} onNavigateToLogin={handleNavigateToLogin} />;
          case 'dashboard':
            return <Dashboard />;
          default:
            return <Login onLoginSuccess={handleLoginSuccess} onNavigateToSignup={handleNavigateToSignup} />;
        }
      })()}
    </>
  );
  
};

export default App;