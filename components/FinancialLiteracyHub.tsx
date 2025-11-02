import React, { useState } from 'react';
import Button from './Button';
import DebtTrapDecoder from './DebtTrapDecoder';
import IncomeInflationTracker from './IncomeInflationTracker';
import InformalPlanner from './InformalPlanner';
import CashflowMirror from './CashflowMirror'; // New import
import LoanRiskLab from './LoanRiskLab'; // New import
import HiddenCostVisualizer from './HiddenCostVisualizer'; // New import
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, CurrencyRupeeIcon, HandRaisedIcon, SparklesIcon, ExclamationTriangleIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { UserProfile } from '../types';

type LiteracySubTab = 'debtTrap' | 'incomeInflation' | 'informalPlanner' | 'cashflowMirror' | 'loanRiskLab' | 'hiddenCostVisualizer';

interface FinancialLiteracyHubProps {
  userProfile: UserProfile;
}

const FinancialLiteracyHub: React.FC<FinancialLiteracyHubProps> = ({ userProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<LiteracySubTab>('debtTrap');

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'debtTrap':
        return <DebtTrapDecoder />;
      case 'incomeInflation':
        return <IncomeInflationTracker userProfile={userProfile} />;
      case 'informalPlanner':
        return <InformalPlanner />;
      case 'cashflowMirror': // New case
        return <CashflowMirror />;
      case 'loanRiskLab': // New case
        return <LoanRiskLab />;
      case 'hiddenCostVisualizer': // New case
        return <HiddenCostVisualizer />;
      default:
        return <DebtTrapDecoder />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl">
      <div className="p-6 pb-0">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">Financial Literacy Hub</h2>
        <div className="flex flex-wrap border-b border-gray-700 mb-6 -mx-2"> {/* Added flex-wrap and negative margin */}
          <Button
            variant={activeSubTab === 'debtTrap' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('debtTrap')}
            className="m-2 p-3 rounded-t-lg flex items-center" // Added margin
          >
            <ChartBarIcon className="h-5 w-5 mr-2" /> Debt Trap Decoder
          </Button>
          <Button
            variant={activeSubTab === 'incomeInflation' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('incomeInflation')}
            className="m-2 p-3 rounded-t-lg flex items-center"
          >
            <CurrencyRupeeIcon className="h-5 w-5 mr-2" /> Income & Inflation
          </Button>
          <Button
            variant={activeSubTab === 'informalPlanner' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('informalPlanner')}
            className="m-2 p-3 rounded-t-lg flex items-center"
          >
            <HandRaisedIcon className="h-5 w-5 mr-2" /> Informal Planner
          </Button>
          <Button
            variant={activeSubTab === 'cashflowMirror' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('cashflowMirror')}
            className="m-2 p-3 rounded-t-lg flex items-center"
          >
            <SparklesIcon className="h-5 w-5 mr-2" /> Cashflow Mirror
          </Button>
          <Button
            variant={activeSubTab === 'loanRiskLab' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('loanRiskLab')}
            className="m-2 p-3 rounded-t-lg flex items-center"
          >
            <ExclamationTriangleIcon className="h-5 w-5 mr-2" /> Loan Risk Lab
          </Button>
          <Button
            variant={activeSubTab === 'hiddenCostVisualizer' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('hiddenCostVisualizer')}
            className="m-2 p-3 rounded-t-lg flex items-center"
          >
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" /> Hidden Costs
          </Button>
        </div>
      </div>

      <div className="flex-grow p-6 pt-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderSubTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FinancialLiteracyHub;