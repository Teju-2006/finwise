import React, { useState } from 'react';
import { LoanAmortization, LoanDetails } from '../types';
import Input from './Input';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartBarIcon, CalculatorIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const DebtTrapDecoder: React.FC = () => {
  const [principal, setPrincipal] = useState(50000);
  const [monthlyInterestRate, setMonthlyInterestRate] = useState(2); // as percentage
  const [tenureMonths, setTenureMonths] = useState(12);
  const [amortizationSchedule, setAmortizationSchedule] = useState<LoanAmortization[]>([]);
  const [effectiveAPR, setEffectiveAPR] = useState(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState(0);
  const [totalRepaid, setTotalRepaid] = useState(0);
  const [monthlyEMI, setMonthlyEMI] = useState(0);

  const calculateLoan = () => {
    if (principal <= 0 || monthlyInterestRate <= 0 || tenureMonths <= 0) {
      alert('Please enter valid loan details.');
      return;
    }

    const monthlyRateDecimal = monthlyInterestRate / 100;
    const annualRateDecimal = Math.pow(1 + monthlyRateDecimal, 12) - 1;
    setEffectiveAPR(annualRateDecimal * 100);

    // EMI calculation using the formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi =
      (principal * monthlyRateDecimal * Math.pow(1 + monthlyRateDecimal, tenureMonths)) /
      (Math.pow(1 + monthlyRateDecimal, tenureMonths) - 1);
    setMonthlyEMI(emi);

    let currentPrincipal = principal;
    let cumulativeInterest = 0;
    const schedule: LoanAmortization[] = [];

    for (let i = 1; i <= tenureMonths; i++) {
      const interestPayment = currentPrincipal * monthlyRateDecimal;
      const principalPayment = emi - interestPayment;
      currentPrincipal -= principalPayment;
      cumulativeInterest += interestPayment;

      schedule.push({
        month: i,
        beginningBalance: currentPrincipal + principalPayment, // Balance before this month's payments
        payment: emi,
        interestPaid: interestPayment,
        principalPaid: principalPayment,
        endingBalance: currentPrincipal > 0 ? currentPrincipal : 0, // Ensure no negative balance
      });
    }

    setAmortizationSchedule(schedule);
    setTotalInterestPaid(cumulativeInterest);
    setTotalRepaid(principal + cumulativeInterest);
  };

  const calculateLateFeeImpact = (emi: number, lateFeeRate = 0.02, missedMonths = 3) => {
    let totalLateFees = 0;
    for (let i = 0; i < missedMonths; i++) {
      totalLateFees += emi * lateFeeRate;
    }
    return totalLateFees;
  };

  const hypotheticalLateFees = monthlyEMI > 0 ? calculateLateFeeImpact(monthlyEMI) : 0;


  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Debt Trap Decoder 📉
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
            <CalculatorIcon className="h-5 w-5 mr-2" /> Loan Details
          </h4>
          <Input
            id="principal"
            label="Loan Principal (INR)"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value))}
            min="1"
            required
          />
          <Input
            id="monthlyInterestRate"
            label="Stated Monthly Interest Rate (%)"
            type="number"
            value={monthlyInterestRate}
            onChange={(e) => setMonthlyInterestRate(parseFloat(e.target.value))}
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
          <Button onClick={calculateLoan} className="mt-6 w-full">
            Calculate Loan Details
          </Button>
        </motion.div>

        {/* Results & Visualizations */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" /> Loan Breakdown
          </h4>
          {amortizationSchedule.length > 0 ? (
            <>
              <p className="text-gray-300 mb-2">
                Monthly EMI:{' '}
                <span className="font-bold text-green-400">{formatCurrency(monthlyEMI)}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Total Repaid:{' '}
                <span className="font-bold text-yellow-300">{formatCurrency(totalRepaid)}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Total Interest Paid:{' '}
                <span className="font-bold text-red-400">{formatCurrency(totalInterestPaid)}</span>
              </p>
              <p className="text-gray-300 mb-4">
                <span className="font-bold text-yellow-300">Effective Annual APR:</span>{' '}
                <span className="font-bold text-red-500">{effectiveAPR.toFixed(2)}%</span>
              </p>

              {/* Simplified Amortization Table */}
              <div className="mt-4 border-t border-gray-600 pt-4">
                <h5 className="text-lg font-semibold text-gray-200 mb-2">First 3 Months Breakdown:</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-400">
                    <thead className="text-xs text-gray-100 uppercase bg-gray-600">
                      <tr>
                        <th scope="col" className="px-3 py-2">Month</th>
                        <th scope="col" className="px-3 py-2">EMI</th>
                        <th scope="col" className="px-3 py-2">Interest</th>
                        <th scope="col" className="px-3 py-2">Principal</th>
                        <th scope="col" className="px-3 py-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.slice(0, 3).map((row) => (
                        <tr key={row.month} className="bg-gray-700 border-b border-gray-600">
                          <td className="px-3 py-2">{row.month}</td>
                          <td className="px-3 py-2">{formatCurrency(row.payment)}</td>
                          <td className="px-3 py-2 text-red-300">{formatCurrency(row.interestPaid)}</td>
                          <td className="px-3 py-2 text-green-300">{formatCurrency(row.principalPaid)}</td>
                          <td className="px-3 py-2">{formatCurrency(row.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Impact Simulator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg"
              >
                <h5 className="text-lg font-semibold text-red-300 mb-2 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-400" /> Debt Trap Warning: Late Payment Impact
                </h5>
                <p className="text-red-200 text-sm">
                  Many instant loan apps charge punitive late fees. If you miss 3 EMIs,
                  with a hypothetical 2% monthly late fee on the EMI, you could incur additional charges of approximately{' '}
                  <span className="font-bold text-red-400">{formatCurrency(hypotheticalLateFees)}</span>.
                  This significantly increases your total debt!
                </p>
              </motion.div>
            </>
          ) : (
            <p className="text-gray-400">Enter loan details and click 'Calculate' to see the breakdown.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DebtTrapDecoder;