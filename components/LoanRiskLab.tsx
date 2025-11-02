import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon, AcademicCapIcon, BoltIcon } from '@heroicons/react/24/outline'; // Reused icons

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const LoanRiskLab: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState(100000);
  const [annualInterestRate, setAnnualInterestRate] = useState(12); // annual %
  const [tenureMonths, setTenureMonths] = useState(24);
  const [defaultProbability, setDefaultProbability] = useState(5); // % chance of missing EMI
  const [lateFeePercentage, setLateFeePercentage] = useState(2); // % of EMI as late fee
  const [loanResults, setLoanResults] = useState<{
    monthlyEMI: number;
    totalInterest: number;
    totalRepayment: number;
    riskAdjustedCost: number;
    potentialLateFees: number;
  } | null>(null);

  const calculateLoanDetails = () => {
    if (loanAmount <= 0 || annualInterestRate <= 0 || tenureMonths <= 0) {
      alert('Please enter valid loan details.');
      return;
    }

    const monthlyInterestRate = annualInterestRate / 100 / 12;
    // EMI calculation using the formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyEMI =
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths)) /
      (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1);

    const totalRepayment = monthlyEMI * tenureMonths;
    const totalInterest = totalRepayment - loanAmount;

    // Simulate potential late fees based on default probability
    const avgMissedPayments = (defaultProbability / 100) * tenureMonths;
    const lateFeePerMissedPayment = monthlyEMI * (lateFeePercentage / 100);
    const potentialLateFees = avgMissedPayments * lateFeePerMissedPayment;

    const riskAdjustedCost = totalRepayment + potentialLateFees;

    setLoanResults({
      monthlyEMI,
      totalInterest,
      totalRepayment,
      riskAdjustedCost,
      potentialLateFees,
    });
  };

  const chainVariant = {
    hidden: { scaleX: 1, originX: 'left' },
    visible: {
      scaleX: 1.2, // Simulate tightening/inflation
      originX: 'left',
      // Fix: Use 'reverse' as a literal type for repeatType
      transition: { repeat: Infinity, repeatType: 'reverse' as const, duration: 1.5 },
    },
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Loan Risk Lab 🪤
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-y-auto custom-scrollbar">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-2" /> Simulate Your Loan
          </h4>
          <Input
            id="loanAmount"
            label="Loan Principal (INR)"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(parseFloat(e.target.value))}
            min="1"
            required
          />
          <Input
            id="annualInterestRate"
            label="Annual Interest Rate (%)"
            type="number"
            value={annualInterestRate}
            onChange={(e) => setAnnualInterestRate(parseFloat(e.target.value))}
            min="0.1"
            step="0.1"
            required
          />
          <Input
            id="tenureMonths"
            label="Loan Tenure (Months)"
            type="number"
            value={tenureMonths}
            onChange={(e) => setTenureMonths(parseInt(e.target.value))}
            min="1"
            required
          />
          <Input
            id="defaultProbability"
            label="Estimated Chance of Missing EMI (%)"
            type="number"
            value={defaultProbability}
            onChange={(e) => setDefaultProbability(parseFloat(e.target.value))}
            min="0"
            max="100"
            step="1"
            required
          />
          <Input
            id="lateFeePercentage"
            label="Late Fee (% of EMI)"
            type="number"
            value={lateFeePercentage}
            onChange={(e) => setLateFeePercentage(parseFloat(e.target.value))}
            min="0"
            step="0.1"
            required
          />
          <Button onClick={calculateLoanDetails} className="mt-6 w-full">
            Analyze Loan Risk
          </Button>
        </motion.div>

        {/* Results & Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <BoltIcon className="h-5 w-5 mr-2" /> Loan Risk Analysis
          </h4>
          {loanResults ? (
            <>
              <p className="text-gray-300 mb-2">
                Monthly EMI:{' '}
                <span className="font-bold text-green-400">{formatCurrency(loanResults.monthlyEMI)}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Total Interest Paid:{' '}
                <span className="font-bold text-red-400">{formatCurrency(loanResults.totalInterest)}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Total Repayment (Principal + Interest):{' '}
                <span className="font-bold text-yellow-300">{formatCurrency(loanResults.totalRepayment)}</span>
              </p>
              <p className="text-gray-300 mb-4">
                Potential Additional Late Fees (Estimated):{' '}
                <span className="font-bold text-yellow-400">{formatCurrency(loanResults.potentialLateFees)}</span>
              </p>
              <p className="text-gray-100 text-lg mb-4">
                <span className="font-bold text-red-500">Risk-Adjusted Total Cost:</span>{' '}
                <span className="font-bold text-red-500">{formatCurrency(loanResults.riskAdjustedCost)}</span>
              </p>

              {/* Debt Trap Visualization */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={chainVariant}
                className="mt-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg text-sm text-red-200"
              >
                <h5 className="text-lg font-semibold text-red-300 mb-2 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-400" /> Debt Trap Visualizer
                </h5>
                <p>
                  This dynamic bar represents the tightening grip of debt when late fees and missed payments occur.
                  Your estimated risk-adjusted cost is{' '}
                  <span className="font-bold text-red-400">{formatCurrency(loanResults.riskAdjustedCost)}</span>.
                  Be very cautious about high-interest loans, especially with volatile income.
                  A small default probability can lead to a significantly higher actual cost!
                </p>
              </motion.div>
            </>
          ) : (
            <p className="text-gray-400">Enter loan parameters and analyze the real cost and risk.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LoanRiskLab;