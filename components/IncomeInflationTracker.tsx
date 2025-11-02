import React, { useState, useEffect, useCallback } from 'react';
import Input from './Input';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { cityService } from '../services/api';
import { CityCostData, UserProfile } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { ChartPieIcon, GlobeAsiaAustraliaIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

interface IncomeInflationTrackerProps {
  userProfile: UserProfile;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const IncomeInflationTracker: React.FC<IncomeInflationTrackerProps> = ({ userProfile }) => {
  const [selectedCity, setSelectedCity] = useState(userProfile.city || 'Mumbai');
  const [currentMonthlyIncome, setCurrentMonthlyIncome] = useState(userProfile.income || 30000);
  const [selectedProfession, setSelectedProfession] = useState(userProfile.profession || 'Software Engineer');
  const [targetSavingsGoal, setTargetSavingsGoal] = useState(1000000); // e.g., 10 lakhs
  const [inflationRate, setInflationRate] = useState(6); // India average, as percentage
  const [futureYears, setFutureYears] = useState(5);

  const [cityData, setCityData] = useState<CityCostData | null>(null);
  const [allCities, setAllCities] = useState<string[]>([]);
  const [allProfessions, setAllProfessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cities = await cityService.getAllCities();
      setAllCities(cities);
      const professions = await cityService.getAllProfessions();
      setAllProfessions(professions);

      if (selectedCity) {
        const data = await cityService.getCityCostData(selectedCity);
        setCityData(data || null);
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load city and profession data.');
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    // Update city data if selectedCity changes
    const updateCityData = async () => {
      if (selectedCity) {
        const data = await cityService.getCityCostData(selectedCity);
        setCityData(data || null);
      } else {
        setCityData(null);
      }
    };
    updateCityData();
  }, [selectedCity]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  // --- Survival Basket Calculation ---
  let survivalBasketCost = 0;
  let survivalBasketPercentage = 0;
  if (cityData) {
    survivalBasketCost = cityData.averageRent + cityData.foodCost + cityData.transportCost + cityData.miscellaneous;
    if (currentMonthlyIncome > 0) {
      survivalBasketPercentage = (survivalBasketCost / currentMonthlyIncome) * 100;
    }
  }

  // --- Real vs. Nominal Income (Inflation Impact) ---
  const futureRealValue = targetSavingsGoal / Math.pow(1 + inflationRate / 100, futureYears);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Real-India Income & Inflation Tracker 🍚
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow overflow-y-auto custom-scrollbar">
        {/* Input & Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <GlobeAsiaAustraliaIcon className="h-5 w-5 mr-2" /> Your Economic Context
          </h4>
          <div className="mb-4">
            <label htmlFor="city" className="block text-gray-300 text-sm font-bold mb-2">
              Your City
            </label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 bg-gray-600 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-500"
            >
              {allCities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <Input
            id="currentMonthlyIncome"
            label="Your Monthly Income (INR)"
            type="number"
            value={currentMonthlyIncome}
            onChange={(e) => setCurrentMonthlyIncome(parseFloat(e.target.value))}
            min="0"
            required
          />
          <div className="mb-4">
            <label htmlFor="profession" className="block text-gray-300 text-sm font-bold mb-2">
              Your Profession
            </label>
            <select
              id="profession"
              value={selectedProfession}
              onChange={(e) => setSelectedProfession(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 bg-gray-600 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-500"
            >
              {allProfessions.map((prof) => (
                <option key={prof} value={prof}>{prof}</option>
              ))}
            </select>
          </div>

          <h4 className="text-xl font-semibold text-yellow-300 mb-4 mt-6 flex items-center">
            <CurrencyRupeeIcon className="h-5 w-5 mr-2" /> Inflation Impact
          </h4>
          <Input
            id="targetSavingsGoal"
            label="Target Savings Goal (INR)"
            type="number"
            value={targetSavingsGoal}
            onChange={(e) => setTargetSavingsGoal(parseFloat(e.target.value))}
            min="1000"
            required
          />
          <Input
            id="inflationRate"
            label="Average Annual Inflation Rate (%)"
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(parseFloat(e.target.value))}
            min="0"
            step="0.1"
            required
          />
          <Input
            id="futureYears"
            label="Years into Future"
            type="number"
            value={futureYears}
            onChange={(e) => setFutureYears(parseInt(e.target.value))}
            min="1"
            required
          />
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md flex flex-col"
        >
          <h4 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <ChartPieIcon className="h-5 w-5 mr-2" /> Financial Realities
          </h4>

          {cityData ? (
            <div className="mb-6">
              <h5 className="text-lg font-semibold text-yellow-300 mb-2">
                Survival Basket Cost in {cityData.city} ({cityData.tier})
              </h5>
              <p className="text-gray-300 mb-1">
                Estimated Monthly Survival Cost: <span className="font-bold text-red-400">{formatCurrency(survivalBasketCost)}</span>
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm ml-4">
                <li>Rent (Basic 1BHK): {formatCurrency(cityData.averageRent)}</li>
                <li>Food (Basic Staples): {formatCurrency(cityData.foodCost)}</li>
                <li>Public Transport: {formatCurrency(cityData.transportCost)}</li>
                <li>Miscellaneous (Minimal): {formatCurrency(cityData.miscellaneous)}</li>
              </ul>
              {currentMonthlyIncome > 0 && (
                <p className="text-gray-200 mt-2 text-lg">
                  This consumes{' '}
                  <span className="font-bold text-yellow-300">
                    {survivalBasketPercentage.toFixed(1)}%
                  </span>{' '}
                  of your current monthly income.
                  {survivalBasketPercentage > 70 && (
                    <span className="text-red-400 ml-2">(High financial fragility!)</span>
                  )}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 mb-6">Select a city to see cost of living data.</p>
          )}

          <div className="mt-4 border-t border-gray-600 pt-4">
            <h5 className="text-lg font-semibold text-yellow-300 mb-2">
              Inflation's Bite: Real vs. Nominal Income
            </h5>
            <p className="text-gray-300 mb-1">
              Your target savings goal of{' '}
              <span className="font-bold text-green-400">{formatCurrency(targetSavingsGoal)}</span> in {futureYears} years,
              considering an inflation rate of {inflationRate}%, will only have the purchasing power of approximately{' '}
              <span className="font-bold text-red-400">{formatCurrency(futureRealValue)}</span> today.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              This shows why simply saving cash is a losing proposition; your money loses value over time.
              You need to invest wisely to beat inflation!
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg text-sm text-blue-200"
          >
            <p className="font-semibold mb-1">Understanding the 'Dark Side':</p>
            <p>
              GDP growth numbers often hide the ground realities of underemployment and high living costs for young Indians.
              Benchmarking your income against local costs and understanding inflation's impact are crucial for true financial independence.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default IncomeInflationTracker;