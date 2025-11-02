import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { Tab } from './Sidebar';
import UserProfile from './UserProfile';
import InvestmentPlans from './InvestmentPlans';
import MonthlyAnalysis from './MonthlyAnalysis';
import AIChatAssistant from './AIChatAssistant';
import FinancialLiteracyHub from './FinancialLiteracyHub';
import BusinessLiteracyQuest from './BusinessLiteracyQuest'; // New import
import { authService } from '../services/api';
import { UserProfile as UserProfileType } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchUserProfile = useCallback(async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserProfile(currentUser);
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const renderContent = () => {
    if (loadingUser) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
      );
    }
    if (!userProfile) {
      // This case should ideally not happen if isAuthenticated is checked before rendering Dashboard
      return (
        <div className="flex-grow flex items-center justify-center text-red-500">
          Error: User profile not loaded. Please log in again.
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return <UserProfile />;
      case 'investmentPlans':
        return <InvestmentPlans userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'monthlyAnalysis':
        return <MonthlyAnalysis />;
      case 'financialLiteracy':
        return <FinancialLiteracyHub userProfile={userProfile} />;
      case 'businessLiteracyQuest': // New case for Business Literacy Quest
        return <BusinessLiteracyQuest userProfile={userProfile} setUserProfile={setUserProfile} />;
      case 'aiChat':
        return <AIChatAssistant />;
      default:
        return <UserProfile />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <motion.main
        className="flex-grow p-8 pl-72 overflow-hidden" // Adjust padding-left for sidebar width
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  );
};

export default Dashboard;