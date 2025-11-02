import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import { motion } from 'framer-motion';
import { LightBulbIcon, WrenchScrewdriverIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, PieLabelRenderProps } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const HiddenCostVisualizer: React.FC = () => {
  const [itemCost, setItemCost] = useState(50000); // e.g., a new machine
  const [expectedLifespanYears, setExpectedLifespanYears] = useState(5);
  const [electricityConsumptionKwH, setElectricityConsumptionKwH] = useState(1); // per hour
  const [usageHoursPerDay, setUsageHoursPerDay] = useState(8);
  const [electricityRate, setElectricityRate] = useState(8); // INR per kWh
  const [maintenanceCostPerYear, setMaintenanceCostPerYear] = useState(2000);
  const [loanEMI, setLoanEMI] = useState(0); // Optional: if purchased on EMI

  const [totalCost, setTotalCost] = useState<{
    directCost: number;
    depreciation: number;
    electricityCost: number;
    maintenance: number;
    loanInterest: number;
    total: number;
    chartData: { name: string; value: number; }[];
  } | null>(null);

  const calculateHiddenCosts = () => {
    if (itemCost <= 0 || expectedLifespanYears <= 0) {
      alert('Please enter valid item cost and lifespan.');
      return;
    }

    const totalElectricityCost = electricityConsumptionKwH * usageHoursPerDay * 365 * expectedLifespanYears * electricityRate;
    const totalMaintenanceCost = maintenanceCostPerYear * expectedLifespanYears;
    const totalDepreciation = itemCost; // Simple linear depreciation over lifespan

    // For simplicity, assuming loanEMI is total interest portion for calculation
    const totalLoanInterest = loanEMI * 12 * expectedLifespanYears; // Assuming monthly EMI contains interest

    const overallTotalCost = itemCost + totalElectricityCost + totalMaintenanceCost + totalLoanInterest;

    const chartData = [
      { name: 'Direct Purchase Cost', value: itemCost },
      { name: 'Depreciation (over lifespan)', value: totalDepreciation },
      { name: 'Electricity Cost (over lifespan)', value: totalElectricityCost },
      { name: 'Maintenance Cost (over lifespan)', value: totalMaintenanceCost },
    ];

    if (loanEMI > 0) {
      chartData.push({ name: 'Loan Interest (over lifespan)', value: totalLoanInterest });
    }

    setTotalCost({
      directCost: itemCost,
      depreciation: totalDepreciation,
      electricityCost: totalElectricityCost,
      maintenance: totalMaintenanceCost,
      loanInterest: totalLoanInterest,
      total: overallTotalCost,
      chartData: chartData.filter(d => d.value > 0), // Filter out zero values for chart clarity
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Hidden Cost Visualizer 🕵️
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
            <WrenchScrewdriverIcon className="h-5 w-5 mr-2" /> Item Details
          </h4>
          <Input
            id="itemCost"
            label="Initial Purchase Cost (INR)"
            type="number"
            value={itemCost}
            onChange={(e) => setItemCost(parseFloat(e.target.value))}
            min="1"
            required
          />
          <Input
            id="expectedLifespanYears"
            label="Expected Lifespan (Years)"
            type="number"
            value={expectedLifespanYears}
            onChange={(e) => setExpectedLifespanYears(parseInt(e.target.value))}
            min="1"
            required
          />
          <Input
            id="electricityConsumptionKwH"
            label="Electricity Consumption (kWh/hour)"
            type="number"
            value={electricityConsumptionKwH}
            onChange={(e) => setElectricityConsumptionKwH(parseFloat(e.target.value))}
            min="0"
            step="0.1"
            required
          />
          <Input
            id="usageHoursPerDay"
            label="Usage Hours Per Day"
            type="number"
            value={usageHoursPerDay}
            onChange={(e) => setUsageHoursPerDay(parseFloat(e.target.value))}
            min="0"
            max="24"
            required
          />
          <Input
            id="electricityRate"
            label="Electricity Rate (INR/kWh)"
            type="number"
            value={electricityRate}
            onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
            min="0"
            step="0.1"
            required
          />
          <Input
            id="maintenanceCostPerYear"
            label="Annual Maintenance Cost (INR)"
            type="number"
            value={maintenanceCostPerYear}
            onChange={(e) => setMaintenanceCostPerYear(parseFloat(e.target.value))}
            min="0"
            required
          />
          <Input
            id="loanEMI"
            label="Monthly Loan Interest Portion (Optional, INR)"
            type="number"
            value={loanEMI}
            onChange={(e) => setLoanEMI(parseFloat(e.target.value))}
            min="0"
          />
          <Button onClick={calculateHiddenCosts} className="mt-6 w-full">
            Visualize True Cost
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
            <ChartPieIcon className="h-5 w-5 mr-2" /> True Cost Breakdown
          </h4>
          {totalCost ? (
            <>
              <p className="text-gray-300 mb-2">
                Initial Purchase Cost:{' '}
                <span className="font-bold text-yellow-300">{formatCurrency(totalCost.directCost)}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Total Maintenance Cost (over {expectedLifespanYears} years):{' '}
                <span className="font-bold text-red-300">{formatCurrency(totalCost.maintenance)}</span>
              </p>
              <p className="text-gray-300 mb-2">
                Total Electricity Cost (over {expectedLifespanYears} years):{' '}
                <span className="font-bold text-red-300">{formatCurrency(totalCost.electricityCost)}</span>
              </p>
              {totalCost.loanInterest > 0 && (
                <p className="text-gray-300 mb-2">
                  Total Loan Interest (over {expectedLifespanYears} years):{' '}
                  <span className="font-bold text-red-300">{formatCurrency(totalCost.loanInterest)}</span>
                </p>
              )}
              <p className="text-gray-100 text-2xl font-bold mt-4">
                Total Cost of Ownership:{' '}
                <span className="text-green-400">{formatCurrency(totalCost.total)}</span>
              </p>

              <div className="mt-6 flex-grow">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={totalCost.chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      // Fix: Removed redundant fill prop from Pie component, as Cell components handle individual slice colors.
                      dataKey="value"
                      // Fix: Explicitly type the 'percent' parameter to resolve arithmetic operation error.
                      // Ensure percent is a number before multiplication.
                      label={({ name, percent }: PieLabelRenderProps) => `${name} ${typeof percent === 'number' ? (percent * 100).toFixed(0) : '0'}%`}
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {/* Fix: Explicitly type the index parameter for clarity and type safety */}
                      {totalCost.chartData.map((_entry, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#374151', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#E5E7EB' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-sm text-blue-200"
              >
                <h5 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
                  <LightBulbIcon className="h-5 w-5 mr-2 text-blue-400" /> Insight: Beyond the Price Tag
                </h5>
                <p>
                  The initial purchase price is just one part of the story! For small businesses,
                  understanding the total cost of ownership (TCO) of assets like machinery, vehicles,
                  or even software is vital for accurate budgeting and long-term profitability.
                </p>
              </motion.div>
            </>
          ) : (
            <p className="text-gray-400">Enter details of your business item to reveal its true cost over time.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HiddenCostVisualizer;