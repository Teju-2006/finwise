import React, { useState, useEffect, useCallback } from 'react';
import { BudgetEntry } from '../types';
import { budgetService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import Input from './Input';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, PieLabelRenderProps } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Color palette for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Add interface for BarChartDataItem to provide type safety
interface BarChartDataItem {
  name: string;
  amount: number;
  color: string;
}

const BudgetBuilder: React.FC = () => {
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCategory, setNewCategory] = useState('');
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');

  const fetchBudgetEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await budgetService.getBudgetEntries();
      setEntries(data);
    } catch (err) {
      console.error('Error fetching budget entries:', err);
      setError('Failed to load budget data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgetEntries();
  }, [fetchBudgetEntries]);

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory || newAmount <= 0) return;

    setLoading(true);
    try {
      const newEntry = await budgetService.addBudgetEntry({
        category: newCategory,
        amount: newAmount,
        type: newType,
        date: new Date().toISOString().split('T')[0], // Current date
      });
      setEntries((prev) => [...prev, newEntry]);
      setNewCategory('');
      setNewAmount(0);
      setNewType('expense');
    } catch (err) {
      setError('Failed to add budget entry.');
      console.error('Error adding budget entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = entries
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = entries
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;

  // Prepare data for Pie Chart (expenses by category)
  const expenseCategories = entries
    .filter((e) => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as { [key: string]: number });

  const pieChartData = Object.entries(expenseCategories).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Prepare data for Bar Chart (income vs expenses)
  const barChartData: BarChartDataItem[] = [ // Use the new interface
    { name: 'Income', amount: totalIncome, color: '#82ca9d' },
    { name: 'Expenses', amount: totalExpenses, color: '#ff8042' },
    { name: 'Net Savings', amount: netSavings, color: '#8884d8' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Budget Builder & Monthly Analysis
      </h3>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto custom-scrollbar">
        {/* Budget Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4">Summary</h4>
          <p className="text-gray-300 text-lg mb-2">
            Total Income: <span className="text-green-400 font-bold">₹{totalIncome.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-gray-300 text-lg mb-2">
            Total Expenses: <span className="text-red-400 font-bold">₹{totalExpenses.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-gray-100 text-2xl font-bold mt-4">
            Net Savings: <span className={netSavings >= 0 ? 'text-green-500' : 'text-red-500'}>₹{netSavings.toLocaleString('en-IN')}</span>
          </p>
        </motion.div>

        {/* Add New Entry Form */}
        <motion.form
          onSubmit={handleAddEntry}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4">Add New Transaction</h4>
          <Input
            id="newCategory"
            label="Category"
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            required
            className="mb-3"
          />
          <Input
            id="newAmount"
            label="Amount (INR)"
            type="number"
            value={newAmount}
            onChange={(e) => setNewAmount(parseFloat(e.target.value))}
            min="0"
            step="any"
            required
            className="mb-3"
          />
          <div className="mb-4">
            <label htmlFor="newType" className="block text-gray-300 text-sm font-bold mb-2">
              Type
            </label>
            <select
              id="newType"
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'income' | 'expense')}
              className="shadow border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <Button type="submit" isLoading={loading} className="w-full">
            Add Entry
          </Button>
        </motion.form>

        {/* Expense Distribution Pie Chart */}
        {pieChartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-700 p-6 rounded-lg shadow-md col-span-1 md:col-span-2"
          >
            <h4 className="text-xl font-semibold text-yellow-300 mb-4">Expense Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  // Fix: Explicitly type the 'percent' parameter to resolve arithmetic operation error.
                  // Ensure percent is a number before multiplication.
                  label={({ name, percent }: PieLabelRenderProps) => `${name} ${typeof percent === 'number' ? (percent * 100).toFixed(0) : '0'}%`}
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E5E7EB' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Monthly Financial Graph (Bar Chart) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md col-span-1 md:col-span-2"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4">Monthly Financial Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis dataKey="name" stroke="#D1D5DB" />
              <YAxis stroke="#D1D5DB" tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E5E7EB' }} />
              <Legend />
              {/* Fix: Updated Bar component to use Cell for dynamic coloring per bar, resolving type error. */}
              <Bar dataKey="amount" animationBegin={0} animationDuration={800}>
                {barChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default BudgetBuilder;