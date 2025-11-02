import React, { useState, useEffect, useCallback } from 'react';
import GovernmentSchemes from './GovernmentSchemes';
import SavingsSimulator from './SavingsSimulator';
import { UserProfile, SchemeRecommendation, LatLng } from '../types';
import { schemesService } from '../services/api';
import { geminiService } from '../services/geminiService';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { FireIcon, RocketLaunchIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';

type InvestmentSubTab = 'schemes' | 'simulator' | 'recommendations';

interface InvestmentPlansProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const InvestmentPlans: React.FC<InvestmentPlansProps> = ({ userProfile, setUserProfile }) => {
  const [activeSubTab, setActiveSubTab] = useState<InvestmentSubTab>('schemes');
  const [recommendations, setRecommendations] = useState<SchemeRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    setRecommendationError(null);
    try {
      // Get user location for Maps grounding if available
      let location: LatLng | undefined;
      if (userLocation) {
        location = userLocation;
      } else if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location); // Cache for future use
          console.log('User location fetched:', location);
        } catch (geoError) {
          console.warn('Geolocation access denied or failed:', geoError);
          // Continue without location if permission denied
        }
      }

      const aiRecs = await geminiService.recommendSchemes(userProfile, location);
      setRecommendations(aiRecs);
    } catch (err: any) {
      setRecommendationError(err.message || 'Failed to fetch AI recommendations.');
      console.error('AI Recommendation Error:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [userProfile, userLocation]);

  useEffect(() => {
    if (activeSubTab === 'recommendations' && recommendations.length === 0 && !loadingRecommendations && !recommendationError) {
      fetchRecommendations();
    }
  }, [activeSubTab, recommendations.length, loadingRecommendations, recommendationError, fetchRecommendations]);

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl">
      <div className="p-6 pb-0">
        <h2 className="text-3xl font-bold text-yellow-400 mb-6">Investment Plans</h2>
        <div className="flex border-b border-gray-700 mb-6">
          <Button
            variant={activeSubTab === 'schemes' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('schemes')}
            className="mr-3 p-3 rounded-t-lg flex items-center"
          >
            <BanknotesIcon className="h-5 w-5 mr-2" /> Government Schemes
          </Button>
          <Button
            variant={activeSubTab === 'simulator' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('simulator')}
            className="mr-3 p-3 rounded-t-lg flex items-center"
          >
            <RocketLaunchIcon className="h-5 w-5 mr-2" /> Savings Simulator
          </Button>
          <Button
            variant={activeSubTab === 'recommendations' ? 'primary' : 'secondary'}
            onClick={() => setActiveSubTab('recommendations')}
            className="p-3 rounded-t-lg flex items-center"
          >
            <FireIcon className="h-5 w-5 mr-2" /> AI Recommendations
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
            {activeSubTab === 'schemes' && <GovernmentSchemes />}
            {activeSubTab === 'simulator' && <SavingsSimulator userProfile={userProfile} setUserProfile={setUserProfile} />}
            {activeSubTab === 'recommendations' && (
              <div className="bg-gray-800 rounded-lg shadow-xl p-6 h-full flex flex-col">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4 border-b border-gray-700 pb-3">
                  AI-Powered Scheme Recommendations
                </h3>
                {userLocation && (
                  <p className="text-sm text-gray-400 mb-4 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1 text-yellow-300" />
                    Recommendations considered your current location.
                  </p>
                )}
                {loadingRecommendations && <LoadingSpinner />}
                {recommendationError && <p className="text-red-500 text-center">{recommendationError}</p>}
                {!loadingRecommendations && !recommendationError && recommendations.length === 0 && (
                  <p className="text-gray-400 text-center">No recommendations available yet. Click 'AI Recommendations' to generate.</p>
                )}
                {!loadingRecommendations && recommendations.length > 0 && (
                  <div className="space-y-4 overflow-y-auto custom-scrollbar">
                    {recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-700 p-4 rounded-lg shadow-md"
                      >
                        <h4 className="text-xl font-semibold text-yellow-300 mb-2">{rec.Scheme}</h4>
                        <p className="text-gray-300">{rec.Reason}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InvestmentPlans;