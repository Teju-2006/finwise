import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile as UserProfileType } from '../types';
import { userService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import Input from './Input';
import { motion, AnimatePresence } from 'framer-motion';
import { TrophyIcon, StarIcon, AcademicCapIcon, BanknotesIcon, UserCircleIcon, BriefcaseIcon, MapPinIcon, BoltIcon, CurrencyRupeeIcon } from '@heroicons/react/24/solid'; // Added BriefcaseIcon, MapPinIcon, BoltIcon, CurrencyRupeeIcon
import CoinStack from './CoinStack'; // New import

const UserProfile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfileType | null>(null);

  const fetchUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getProfile();
      setUserProfile(data);
      setEditedProfile(data); // Initialize edited profile
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setEditedProfile((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.updateProfile(editedProfile);
      setUserProfile(updated);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to save profile changes.');
      console.error('Error saving profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  if (!userProfile) {
    return <p className="text-gray-400 text-center">User profile not found.</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg shadow-xl p-6 h-full flex flex-col"
    >
      <h2 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        User Profile
      </h2>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
              <UserCircleIcon className="h-6 w-6 mr-2" /> Personal Details
            </h3>
            {isEditing && editedProfile ? (
              <>
                <Input id="name" label="Name" value={editedProfile.name} onChange={handleEditChange} />
                <Input id="age" label="Age" type="number" value={editedProfile.age} onChange={handleEditChange} />
                <Input id="income" label="Income (INR/month)" type="number" value={editedProfile.income} onChange={handleEditChange} />
                <Input id="profession" label="Profession" value={editedProfile.profession} onChange={handleEditChange} /> {/* Added profession */}
                <Input id="city" label="City" value={editedProfile.city} onChange={handleEditChange} /> {/* Added city */}
                <div className="mb-4">
                  <label htmlFor="financialGoal" className="block text-gray-300 text-sm font-bold mb-2">
                    Financial Goal
                  </label>
                  <select
                    id="financialGoal"
                    value={editedProfile.financialGoal}
                    onChange={handleEditChange}
                    className="shadow border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-500"
                  >
                    <option value="Early Retirement">Early Retirement</option>
                    <option value="Buying a House">Buying a House</option>
                    <option value="Child's Education">Child's Education</option>
                    <option value="Tax Savings">Tax Savings</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-300 mb-2"><span className="font-semibold text-yellow-300">Name:</span> {userProfile.name}</p>
                <p className="text-gray-300 mb-2 flex items-center"><BriefcaseIcon className="h-5 w-5 mr-2 text-yellow-400" /> <span className="font-semibold text-yellow-300">Profession:</span> {userProfile.profession}</p> {/* Display profession */}
                <p className="text-gray-300 mb-2 flex items-center"><MapPinIcon className="h-5 w-5 mr-2 text-yellow-400" /> <span className="font-semibold text-yellow-300">City:</span> {userProfile.city}</p> {/* Display city */}
                <p className="text-gray-300 mb-2"><span className="font-semibold text-yellow-300">Age:</span> {userProfile.age}</p>
                <p className="text-gray-300 mb-2"><span className="font-semibold text-yellow-300">Income:</span> ₹{userProfile.income.toLocaleString('en-IN')}</p>
                <p className="text-gray-300 mb-2"><span className="font-semibold text-yellow-300">Financial Goal:</span> {userProfile.financialGoal}</p>
              </>
            )}
            {isEditing ? (
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="secondary" onClick={() => { setIsEditing(false); setEditedProfile(userProfile); }}>Cancel</Button>
                <Button onClick={handleSaveProfile} isLoading={loading}>Save</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="mt-4">Edit Profile</Button>
            )}
          </div>

          <div className="bg-gray-700 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
              <TrophyIcon className="h-6 w-6 mr-2" /> Gamification Progress
            </h3>
            {userProfile.gameProgress ? (
              <>
                <p className="text-gray-300 mb-2 flex items-center"><StarIcon className="h-5 w-5 mr-2 text-yellow-400" /> <span className="font-semibold text-yellow-300">Overall Level:</span> {userProfile.level}</p>
                <p className="text-gray-300 mb-2 flex items-center"><BoltIcon className="h-5 w-5 mr-2 text-yellow-400" /> <span className="font-semibold text-yellow-300">XP:</span> {userProfile.gameProgress.xp}</p>
                <div className="text-gray-300 mb-2">
                  <span className="font-semibold text-yellow-300 flex items-center mb-2"><CurrencyRupeeIcon className="h-5 w-5 mr-2 text-green-400" /> Coins: {userProfile.gameProgress.coins}</span>
                  <CoinStack coins={userProfile.gameProgress.coins} /> {/* Integrate CoinStack here */}
                </div>
                <div className="mb-2">
                  <p className="text-gray-300 mb-2 flex items-center"><AcademicCapIcon className="h-5 w-5 mr-2 text-yellow-400" /> <span className="font-semibold text-yellow-300">Badges Earned:</span></p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <AnimatePresence>
                      {userProfile.badges.map((badge, index) => (
                        <motion.span
                          key={badge}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-yellow-500 text-gray-900 text-sm px-3 py-1 rounded-full flex items-center shadow-md"
                        >
                          <TrophyIcon className="h-4 w-4 mr-1 text-yellow-300" /> {badge}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400">Start a quest to begin your gamified learning journey!</p>
            )}

            {/* Future gamification elements could go here */}
            <div className="mt-6 p-4 bg-gray-800 rounded-lg text-center text-gray-400">
              <p>Achieve new milestones to earn more badges and level up!</p>
            </div>
          </div>
        </div>

        {/* Financial Health Snapshot (Optional: Could pull from MonthlyAnalysis data) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-gray-700 p-6 rounded-lg shadow-md mb-6"
        >
          <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center">
            <BanknotesIcon className="h-6 w-6 mr-2" /> Financial Snapshot (Mock)
          </h3>
          <p className="text-gray-300 mb-2"><span className="font-semibold text-yellow-300">Emergency Fund:</span> 6 months of expenses</p>
          <p className="text-gray-300 mb-2"><span className="font-semibold text-yellow-300">Debt-to-Income Ratio:</span> 20% (Healthy)</p>
          <p className="text-gray-300 mb-2"><span className="font-semibold text-yellow-300">Investment Growth (YTD):</span> +12%</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserProfile;