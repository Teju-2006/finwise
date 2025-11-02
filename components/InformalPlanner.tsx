import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { HandRaisedIcon, ShieldCheckIcon, BanknotesIcon } from '@heroicons/react/24/outline'; // Replaced PiggyBankIcon with BanknotesIcon
import GovernmentSchemes from './GovernmentSchemes'; // Reusing existing component for scheme details

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const InformalPlanner: React.FC = () => {
  const [averageMonthlyIncome, setAverageMonthlyIncome] = useState(30000);
  const [fixedSalaryPercentage, setFixedSalaryPercentage] = useState(70); // % of avg income to pay self
  const [incomeSmoothingFundRecommendation, setIncomeSmoothingFundRecommendation] = useState(0);

  const calculateIncomeSmoothing = () => {
    if (averageMonthlyIncome <= 0 || fixedSalaryPercentage <= 0 || fixedSalaryPercentage > 100) {
      alert('Please enter valid income and percentage.');
      return;
    }
    const fixedSalary = averageMonthlyIncome * (fixedSalaryPercentage / 100);
    const surplusForFund = averageMonthlyIncome - fixedSalary;
    setIncomeSmoothingFundRecommendation(surplusForFund);
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Informal Economy Financial Planner 🛠️
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-y-auto custom-scrollbar">
        {/* Income Smoothing */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <HandRaisedIcon className="h-5 w-5 mr-2" /> Income Smoothing Fund
          </h4>
          <p className="text-gray-300 mb-4">
            For irregular income earners, a fixed "salary" and an income smoothing fund can provide stability.
          </p>
          <Input
            id="averageMonthlyIncome"
            label="Your Average Monthly Income (INR)"
            type="number"
            value={averageMonthlyIncome}
            onChange={(e) => setAverageMonthlyIncome(parseFloat(e.target.value))}
            min="0"
            required
          />
          <Input
            id="fixedSalaryPercentage"
            label="Percentage of Income to Pay Yourself Monthly (%)"
            type="number"
            value={fixedSalaryPercentage}
            onChange={(e) => setFixedSalaryPercentage(parseFloat(e.target.value))}
            min="10"
            max="100"
            step="1"
            required
          />
          <Button onClick={calculateIncomeSmoothing} className="mt-6 w-full">
            Recommend Smoothing
          </Button>

          {incomeSmoothingFundRecommendation > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg text-sm text-green-200"
            >
              <h5 className="text-lg font-semibold text-green-300 mb-2 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" /> Recommendation {/* Changed to BanknotesIcon */}
              </h5>
              <p>
                Pay yourself a fixed salary of{' '}
                <span className="font-bold">{formatCurrency(averageMonthlyIncome * (fixedSalaryPercentage / 100))}</span>{' '}
                each month.
              </p>
              <p className="mt-2">
                Allocate the surplus of{' '}
                <span className="font-bold">{formatCurrency(incomeSmoothingFundRecommendation)}</span>{' '}
                (during good months) to an "Income Smoothing Fund" to draw from in lean months.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Government Schemes for Safety Net */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2" /> Government Safety Nets
          </h4>
          <p className="text-gray-300 mb-4">
            Gig workers often lack formal social security. Explore these government schemes to build your own safety net:
          </p>

          <div className="space-y-4">
            <div className="bg-gray-600 p-4 rounded-lg shadow-inner">
              <h5 className="text-lg font-semibold text-yellow-300 mb-2">Pradhan Mantri Suraksha Bima Yojana (PMSBY)</h5>
              <p className="text-gray-300 text-sm">
                An accidental death & disability insurance scheme. Very low premium (₹20/year). Essential for income stability.
              </p>
              <Button variant="secondary" className="mt-3 text-xs px-2 py-1">Learn More</Button> {/* Could link to a modal or section */}
            </div>
            <div className="bg-gray-600 p-4 rounded-lg shadow-inner">
              <h5 className="text-lg font-semibold text-yellow-300 mb-2">Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)</h5>
              <p className="text-gray-300 text-sm">
                A life insurance scheme offering ₹2 Lakh cover at an annual premium of ₹436.
              </p>
              <Button variant="secondary" className="mt-3 text-xs px-2 py-1">Learn More</Button>
            </div>
            <div className="bg-gray-600 p-4 rounded-lg shadow-inner">
              <h5 className="text-lg font-semibold text-yellow-300 mb-2">Atal Pension Yojana (APY)</h5>
              <p className="text-gray-300 text-sm">
                A pension scheme for workers in the unorganized sector, providing a guaranteed pension after 60.
              </p>
              <Button variant="secondary" className="mt-3 text-xs px-2 py-1">Learn More</Button>
            </div>
            <div className="bg-gray-600 p-4 rounded-lg shadow-inner">
              <h5 className="text-lg font-semibold text-yellow-300 mb-2">National Pension System (NPS)</h5>
              <p className="text-gray-300 text-sm">
                A voluntary retirement savings scheme for building a retirement corpus. (See Investment Plans for more).
              </p>
              <Button variant="secondary" className="mt-3 text-xs px-2 py-1">View Details</Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-purple-900 bg-opacity-30 border border-purple-700 rounded-lg text-sm text-purple-200"
          >
            <p className="font-semibold mb-1">Bridging the Gap:</p>
            <p>
              The informal sector is a huge part of the Indian economy. Understanding and leveraging these
              government schemes is crucial for financial stability and building a future without a traditional employer safety net.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default InformalPlanner;