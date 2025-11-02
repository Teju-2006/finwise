
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { motion } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import * as THREE from 'three';
import { UserProfile } from '../types';
import { userService } from '../services/api';

interface CompoundInterestModelProps {
  initialAmount: number;
  monthlyDeposit: number;
  interestRate: number; // annual rate
  years: number;
  finalValue: number; // Added to pass down calculated final value for display
  totalInvested: number; // Added to pass down calculated total invested
  interestEarned: number; // Added to pass down calculated interest earned
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// 3D Model representing compounding growth
const GrowthCylinder: React.FC<CompoundInterestModelProps> = ({
  initialAmount,
  monthlyDeposit,
  interestRate,
  years,
  finalValue,
  totalInvested,
  interestEarned,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Scale the cylinder height based on final value
  const maxHeight = 10; // Max visual height for the cylinder
  const scaleFactor = 0.0001; // Adjust this to make the scale visually appealing
  const height = Math.min(maxHeight, finalValue * scaleFactor);

  useFrame(() => {
    // Simple rotation for visual appeal
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[1, 1, height, 32]} />
        <meshStandardMaterial color="#FFD700" metalness={0.8} roughness={0.2} />
      </mesh>
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {`Future Value: ${formatCurrency(finalValue)}`}
      </Text>
      <Text
        position={[0, height + 1, 0]}
        fontSize={0.3}
        color="lightgreen"
        anchorX="center"
        anchorY="middle"
      >
        {`Interest Earned: ${formatCurrency(interestEarned)}`}
      </Text>
      <Text
        position={[0, height + 1.5, 0]}
        fontSize={0.2}
        color="lightblue"
        anchorX="center"
        anchorY="middle"
      >
        {`Total Invested: ${formatCurrency(totalInvested)}`}
      </Text>
    </>
  );
};

interface SavingsSimulatorProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const SavingsSimulator: React.FC<SavingsSimulatorProps> = ({ userProfile, setUserProfile }) => {
  const [initialAmount, setInitialAmount] = useState(10000);
  const [monthlyDeposit, setMonthlyDeposit] = useState(2000);
  const [interestRate, setInterestRate] = useState(7.1); // annual rate
  const [years, setYears] = useState(15); // investment period

  const totalMonths = years * 12;
  const monthlyInterestRate = interestRate / 100 / 12;

  const calculateFutureValue = useCallback(() => {
    let principal = initialAmount;
    let totalInvestedAmount = initialAmount; // renamed to avoid conflict
    for (let i = 0; i < totalMonths; i++) {
      principal = principal * (1 + monthlyInterestRate) + monthlyDeposit;
      totalInvestedAmount += monthlyDeposit;
    }
    return { principal, totalInvested: totalInvestedAmount };
  }, [initialAmount, monthlyDeposit, monthlyInterestRate, totalMonths]);

  const { principal: finalValue, totalInvested } = calculateFutureValue();
  const interestEarned = finalValue - totalInvested;

  // Gamification Logic
  useEffect(() => {
    const checkAchievements = async () => {
      if (!userProfile) return;

      const newBadges: string[] = [];
      const currentBadges = new Set(userProfile.badges);

      // "Savings Starter" badge: Final value is at least 50% more than total invested
      const minGrowthForStarter = totalInvested * 1.5;
      if (finalValue > minGrowthForStarter && !currentBadges.has("Savings Starter")) {
        newBadges.push("Savings Starter");
      }

      // "Wealth Builder" badge: Final value exceeds 1,000,000 INR
      if (finalValue >= 1_000_000 && !currentBadges.has("Wealth Builder")) {
        newBadges.push("Wealth Builder");
      }

      // "Time Alchemist" badge: Simulation period is 20 years or more
      if (years >= 20 && !currentBadges.has("Time Alchemist")) {
        newBadges.push("Time Alchemist");
      }

      if (newBadges.length > 0) {
        const updatedBadges = [...userProfile.badges, ...newBadges];
        // Simple level up: level is total badges + 1
        const newLevel = updatedBadges.length + 1;

        const updatedProfile = {
          ...userProfile,
          badges: updatedBadges,
          level: newLevel,
        };

        try {
          const persistedProfile = await userService.updateProfile(updatedProfile);
          setUserProfile(persistedProfile);
          newBadges.forEach(badge => console.log(`Achievement Unlocked: ${badge}!`));
          console.log(`User Leveled Up to: ${persistedProfile.level}`);
          // Future: add a UI notification here (e.g., toast)
        } catch (error) {
          console.error('Failed to update user profile with new achievements:', error);
        }
      }
    };

    // Debounce achievement check to prevent too many API calls on rapid input changes
    const timeoutId = setTimeout(() => {
      checkAchievements();
    }, 1000); // 1-second debounce

    return () => clearTimeout(timeoutId);

  }, [
    finalValue,
    totalInvested,
    years,
    initialAmount, // Include for re-calculation of totalInvested if it changes directly
    monthlyDeposit, // Include for re-calculation of totalInvested if it changes directly
    totalMonths,    // Include for re-calculation of totalInvested if it changes directly
    userProfile, // Dependency on userProfile to check existing badges
    setUserProfile, // Dependency to update the parent state
  ]);

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-xl p-6">
      <h3 className="text-3xl font-bold text-yellow-400 mb-6 border-b border-gray-700 pb-4">
        Savings Simulator: Compound Interest
      </h3>

      <div className="flex flex-col lg:flex-row flex-grow gap-6">
        {/* Controls Panel */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:w-1/3 p-4 bg-gray-700 rounded-lg shadow-md flex flex-col justify-between"
        >
          <div>
            <Input
              id="initialAmount"
              label="Initial Investment (INR)"
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(parseFloat(e.target.value))}
              min="0"
            />
            <Input
              id="monthlyDeposit"
              label="Monthly Deposit (INR)"
              type="number"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(parseFloat(e.target.value))}
              min="0"
            />
            <Input
              id="interestRate"
              label="Annual Interest Rate (%)"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              step="0.1"
              min="0"
            />
            <Input
              id="years"
              label="Investment Period (Years)"
              type="number"
              value={years}
              onChange={(e) => setYears(parseFloat(e.target.value))}
              min="1"
            />
          </div>
          <Button className="mt-6 w-full">Simulate Growth</Button>
        </motion.div>

        {/* 3D Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:w-2/3 bg-gray-900 rounded-lg overflow-hidden relative"
        >
          <Canvas
            camera={{ position: [5, 5, 5], fov: 60 }}
            shadows
            className="w-full h-full"
          >
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
            <pointLight position={[-10, -10, -10]} />
            <GrowthCylinder
              initialAmount={initialAmount}
              monthlyDeposit={monthlyDeposit}
              interestRate={interestRate}
              years={years}
              finalValue={finalValue}
              totalInvested={totalInvested}
              interestEarned={interestEarned}
            />
            <OrbitControls enableZoom enablePan />
            <gridHelper args={[10, 10]} />
          </Canvas>
          <div className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded text-sm">
            Interact: Drag to rotate, Scroll to zoom
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SavingsSimulator;