import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { motion } from 'framer-motion';
import { SparklesIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Add interface for CashflowChartDataItem to provide type safety
interface CashflowChartDataItem {
  name: string;
  value: number;
  color: string;
}

const CashflowMirror: React.FC = () => {
  const [revenue, setRevenue] = useState(100000);
  const [fixedCosts, setFixedCosts] = useState(30000);
  const [variableCosts, setVariableCosts] = useState(20000);
  const [creditGiven, setCreditGiven] = useState(10000); // Money owed by customers
  const [creditReceived, setCreditReceived] = useState(5000); // Money owed to suppliers
  const [cashflowResult, setCashflowResult] = useState<{ real: number; ideal: number; moneyLeaks: number } | null>(null);

  const calculateCashflow = () => {
    // Ideal Cashflow: Revenue - (Fixed Costs + Variable Costs)
    const idealCashflow = revenue - (fixedCosts + variableCosts);

    // Real Cashflow: Accounts for credit issues
    // Money comes in later from credit given, money goes out sooner for credit received
    const realCashflow = revenue - fixedCosts - variableCosts - creditGiven + creditReceived;

    // Money leaks are the difference between ideal and real due to credit mismanagement
    const moneyLeaks = idealCashflow - realCashflow;

    setCashflowResult({ real: realCashflow, ideal: idealCashflow, moneyLeaks: moneyLeaks });
  };

  const data: CashflowChartDataItem[] = cashflowResult ? [ // Use the new interface
    { name: 'Ideal Cashflow', value: cashflowResult.ideal, color: '#82ca9d' },
    { name: 'Real Cashflow', value: cashflowResult.real, color: '#8884d8' },
    { name: 'Money Leaks', value: cashflowResult.moneyLeaks > 0 ? cashflowResult.moneyLeaks : 0, color: '#ff8042' },
  ] : [];

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Cashflow Mirror: Reality Check 🪞
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
            <CurrencyDollarIcon className="h-5 w-5 mr-2" /> Business Financials (Monthly Avg)
          </h4>
          <Input
            id="revenue"
            label="Total Revenue (INR)"
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(parseFloat(e.target.value))}
            min="0"
            required
          />
          <Input
            id="fixedCosts"
            label="Fixed Costs (Rent, Salaries - INR)"
            type="number"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(parseFloat(e.target.value))}
            min="0"
            required
          />
          <Input
            id="variableCosts"
            label="Variable Costs (Raw materials, Utilities - INR)"
            type="number"
            value={variableCosts}
            onChange={(e) => setVariableCosts(parseFloat(e.target.value))}
            min="0"
            required
          />
          <Input
            id="creditGiven"
            label="Credit Given to Customers (Receivables - INR)"
            type="number"
            value={creditGiven}
            onChange={(e) => setCreditGiven(parseFloat(e.target.value))}
            min="0"
          />
          <Input
            id="creditReceived"
            label="Credit Received from Suppliers (Payables - INR)"
            type="number"
            value={creditReceived}
            onChange={(e) => setCreditReceived(parseFloat(e.target.value))}
            min="0"
          />
          <Button onClick={calculateCashflow} className="mt-6 w-full">
            Analyze Cashflow
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
            <ChartBarIcon className="h-5 w-5 mr-2" /> Your Cashflow Insights
          </h4>
          {cashflowResult ? (
            <>
              <p className="text-gray-300 mb-2">
                Ideal Cashflow (If all money arrived on time):{' '}
                <span className="font-bold text-green-400">{formatCurrency(cashflowResult.ideal)}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Real Cashflow (With credit effects):{' '}
                <span className="font-bold text-yellow-300">{formatCurrency(cashflowResult.real)}</span>
              </p>
              {cashflowResult.moneyLeaks > 0 && (
                <p className="text-red-300 mb-4">
                  Potential Money Leaks (Due to credit mismanagement):{' '}
                  <span className="font-bold text-red-400">{formatCurrency(cashflowResult.moneyLeaks)}</span>
                </p>
              )}

              <div className="mt-4 flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="name" stroke="#D1D5DB" />
                    <YAxis stroke="#D1D5DB" tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E5E7EB' }} />
                    <Legend />
                    {/* Fix: Updated Bar component to use Cell for dynamic coloring per bar, resolving type error. */}
                    <Bar dataKey="value" animationBegin={0} animationDuration={800}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-orange-900 bg-opacity-30 border border-orange-700 rounded-lg text-sm text-orange-200"
              >
                <h5 className="text-lg font-semibold text-orange-300 mb-2 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2" /> Insight: Cash is King!
                </h5>
                <p>
                  Even profitable businesses can fail without enough cash. Managing receivables (money owed to you)
                  and payables (money you owe) is crucial for smooth operations. Aim to collect faster and pay slower!
                </p>
              </motion.div>
            </>
          ) : (
            <p className="text-gray-400">Enter your business financials and click 'Analyze' to see your cashflow reality.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CashflowMirror;