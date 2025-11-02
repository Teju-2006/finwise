import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scheme } from '../types';
import { schemesService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const GovernmentSchemes: React.FC = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await schemesService.getGovernmentSchemes();
      setSchemes(data);
    } catch (err) {
      console.error('Error fetching schemes:', err);
      setError('Failed to load government schemes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchemes();
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [fetchSchemes]);

  useEffect(() => {
    if (schemes.length > 0) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      intervalRef.current = window.setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % schemes.length);
      }, 5000); // Auto-loop every 5 seconds
    }
  }, [schemes]);

  const goToNext = useCallback(() => {
    if (schemes.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % schemes.length);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % schemes.length);
        }, 5000);
      }
    }
  }, [schemes]);

  const goToPrevious = useCallback(() => {
    if (schemes.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + schemes.length) % schemes.length);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % schemes.length);
        }, 5000);
      }
    }
  }, [schemes]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (schemes.length === 0) {
    return <p className="text-gray-400 text-center">No schemes available.</p>;
  }

  const currentScheme = schemes[currentIndex];

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 h-full flex flex-col">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-gray-700 pb-3">
        Top Government Schemes for Indians
      </h3>
      <div className="relative flex-grow flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex-shrink-0 flex items-center justify-center p-4"
          >
            {currentScheme && (
              <div className="bg-gray-700 p-6 rounded-lg shadow-md max-w-2xl w-full text-center">
                <h4 className="text-3xl font-bold text-yellow-300 mb-3">
                  {currentScheme.name}
                </h4>
                <p className="text-gray-300 mb-2">
                  <span className="font-semibold text-yellow-300">Interest Rate:</span>{' '}
                  {currentScheme.interestRate}%
                </p>
                <p className="text-gray-300 mb-2">
                  <span className="font-semibold text-yellow-300">Lock-in Period:</span>{' '}
                  {currentScheme.lockInPeriod}
                </p>
                <p className="text-gray-400 mt-4 text-left">
                  <span className="font-semibold text-yellow-300">Description:</span>{' '}
                  {currentScheme.description}
                </p>
                <p className="text-gray-400 mt-2 text-left">
                  <span className="font-semibold text-yellow-300">Eligibility:</span>{' '}
                  {currentScheme.eligibility.join(', ')}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full shadow-lg z-10 ml-2"
          aria-label="Previous scheme"
        >
          &#8249;
        </button>
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full shadow-lg z-10 mr-2"
          aria-label="Next scheme"
        >
          &#8250;
        </button>

        <div className="absolute bottom-4 flex space-x-2">
          {schemes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                if (intervalRef.current) {
                  window.clearInterval(intervalRef.current);
                  intervalRef.current = window.setInterval(() => {
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % schemes.length);
                  }, 5000);
                }
              }}
              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                currentIndex === idx ? 'bg-yellow-500' : 'bg-gray-500 hover:bg-gray-400'
              }`}
              aria-label={`Go to scheme ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GovernmentSchemes;