import React from 'react';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  ChartBarIcon,
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon, // New icon for Literacy Hub
  BuildingStorefrontIcon, // New icon for Business Literacy Quest
} from '@heroicons/react/24/outline';
import { authService } from '../services/api';

export type Tab = 'profile' | 'investmentPlans' | 'monthlyAnalysis' | 'aiChat' | 'financialLiteracy' | 'businessLiteracyQuest'; // Added new tab

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'profile', icon: UserCircleIcon, label: 'User Profile' },
  { id: 'investmentPlans', icon: BanknotesIcon, label: 'Investment Plans' },
  { id: 'monthlyAnalysis', icon: ChartBarIcon, label: 'Monthly Analysis' },
  { id: 'financialLiteracy', icon: BookOpenIcon, label: 'Literacy Hub' },
  { id: 'businessLiteracyQuest', icon: BuildingStorefrontIcon, label: 'Business Quest' }, // New navigation item
  { id: 'aiChat', icon: ChatBubbleLeftRightIcon, label: 'AI Chat Assistant' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const handleLogout = () => {
    authService.logout();
    window.location.reload(); // Simple reload to go back to login page
  };

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 100, duration: 0.5 }}
      className="fixed inset-y-0 left-0 w-64 bg-gray-800 text-gray-100 p-5 shadow-lg flex flex-col z-20"
    >
      <div className="flex items-center justify-center mb-10 mt-2">
        <h1 className="text-3xl font-extrabold text-yellow-400">FinWise</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <motion.li
              key={item.id}
              className="mb-3"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => onTabChange(item.id as Tab)}
                className={`flex items-center w-full py-3 px-4 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-yellow-600 text-gray-900 shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-yellow-300'
                }`}
              >
                <item.icon className="h-6 w-6 mr-3" />
                <span className="font-medium text-lg">{item.label}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <motion.button
          onClick={handleLogout}
          className="flex items-center w-full py-3 px-4 rounded-lg text-red-400 hover:bg-red-900 hover:text-white transition-all duration-200"
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6 mr-3" />
          <span className="font-medium text-lg">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;