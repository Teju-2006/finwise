import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sparkles, Sky } from '@react-three/drei'; // Added Sparkles, Sky
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';
import Input from './Input';
import LoadingSpinner from './LoadingSpinner';
import { UserProfile, Quest, QuestLevel, GameProgress, ChatMessage } from '../types';
import { gameService, userService } from '../services/api';
import { geminiService } from '../services/geminiService';
import { BuildingStorefrontIcon, SparklesIcon, XMarkIcon, TrophyIcon, StarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline'; // Added icons

interface BusinessLiteracyQuestProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

// Simplified 3D Building component for the city map
interface BuildingProps {
  position: [number, number, number];
  color: string; // Base color
  name: string;
  onClick: () => void;
  initialScale: number; // Uniform scale factor
  isUnlocked: boolean;
  isCompleted: boolean;
}

const Building: React.FC<BuildingProps> = ({ position, color, name, onClick, initialScale, isUnlocked, isCompleted }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  const handlePointerOver = useCallback(() => setHovered(true), []);
  const handlePointerOut = useCallback(() => setHovered(false), []);

  const currentScale = hovered ? initialScale * 1.1 : initialScale; // Calculate effective scale

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Original rotation
      meshRef.current.rotation.y += 0.005;

      // Pulse/glow for unlocked (but not completed) buildings
      if (isUnlocked && !isCompleted) {
        const glowFactor = Math.sin(clock.getElapsedTime() * 2) * 0.2 + 0.8; // Varies between 0.6 and 1.0
        const baseColor = new THREE.Color(color);
        (meshRef.current.material as THREE.MeshStandardMaterial).emissive.set(baseColor).multiplyScalar(glowFactor * 0.5); // Subtle glow
        (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.8;
      } else {
        (meshRef.current.material as THREE.MeshStandardMaterial).emissive.setScalar(0); // No glow
        (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
        position={[0, currentScale / 2, 0]} // Center the box based on its height
      >
        <boxGeometry args={[currentScale, currentScale, currentScale]} />
        <meshStandardMaterial
          color={hovered ? '#facc15' : color} // Yellow on hover
          metalness={0.8}
          roughness={0.2}
          // Initial emissive color (will be animated in useFrame)
          emissive={isUnlocked && !isCompleted ? new THREE.Color(color).multiplyScalar(0.2) : new THREE.Color(0x000000)}
          emissiveIntensity={isUnlocked && !isCompleted ? 0.8 : 0}
        />
      </mesh>
      <Text
        position={[0, currentScale + 0.3, 0]} // Position above the box
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        material-toneMapped={false}
      >
        {name}
      </Text>
      {/* Sparkle effect for completed quests */}
      {isCompleted && (
        <Sparkles
          count={50}
          scale={[currentScale * 2, currentScale * 2, currentScale * 2]} // Scale sparkles relative to building size
          size={2}
          position={[0, currentScale / 2, 0]} // Position sparkles around the center of the building
          color="#FFD700" // Golden sparkle color
          speed={0.5}
          opacity={0.7}
          noise={0.5}
        />
      )}
    </group>
  );
};

// Simple component for non-interactive background buildings
interface BackgroundBuildingProps {
  position: [number, number, number];
  color: string;
  dimensions: [number, number, number]; // width, height, depth
}

const BackgroundBuilding: React.FC<BackgroundBuildingProps> = ({ position, color, dimensions }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [width, height, depth] = dimensions;
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002; // Slow rotation for ambient effect
    }
  });
  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.5} />
      </mesh>
    </group>
  );
};


// AI Mentor System Prompt
const gameMentorSystemInstruction = `You are FinWise Mentor AI, teaching small business owners essential financial, tax, and sales literacy. Use relatable, motivational Indian examples (kirana store, chai stall, tailoring business, small online seller). Encourage users with simple Hindi-English phrases. Always provide clear, concise, and educational feedback. If a user provides a correct answer, praise them and explain why it's correct. If incorrect, gently guide them towards the right concept.`;

const BusinessLiteracyQuest: React.FC<BusinessLiteracyQuestProps> = ({ userProfile, setUserProfile }) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentGameProgress, setCurrentGameProgress] = useState<GameProgress>(userProfile.gameProgress || { level: 1, xp: 0, coins: 0, unlockedQuests: [], completedLevels: {} });
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [activeLevel, setActiveLevel] = useState<QuestLevel | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>([]);
  const [isMentorLoading, setIsMentorLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMentorSessionInitialized = useRef(false);

  const [showRewardModal, setShowRewardModal] = useState(false);
  const [earnedReward, setEarnedReward] = useState<{ xp: number; coins: number; badge?: string } | null>(null);

  const [showPremiumTrialModal, setShowPremiumTrialModal] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesEndRef]);

  useEffect(() => {
    if (!isMentorSessionInitialized.current) {
      try {
        geminiService.initGameMentorSession(gameMentorSystemInstruction);
        isMentorSessionInitialized.current = true;
      } catch (err: any) {
        setError(`Failed to initialize AI mentor: ${err.message}`);
      }
    }
  }, []);

  // Fetch quests and user progress on mount
  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedQuests = await gameService.getAllQuests();
        setQuests(fetchedQuests);

        const fetchedProgress = await gameService.getGameProgress(userProfile.id);
        setCurrentGameProgress(fetchedProgress);

        // Set initial active quest/level based on progress
        if (fetchedProgress.currentQuestId && fetchedProgress.currentLevelId) {
          const quest = fetchedQuests.find(q => q.id === fetchedProgress.currentQuestId);
          if (quest) {
            setActiveQuest(quest);
            const level = quest.levels.find(l => l.id === fetchedProgress.currentLevelId);
            setActiveLevel(level || null);
          }
        } else if (fetchedProgress.unlockedQuests.length > 0) {
          const firstUnlockedQuestId = fetchedProgress.unlockedQuests[0];
          const firstQuest = fetchedQuests.find(q => q.id === firstUnlockedQuestId);
          setActiveQuest(firstQuest || null);
          // Find the first uncompleted level for this quest
          const completedLevelsForQuest = fetchedProgress.completedLevels[firstUnlockedQuestId] || [];
          const firstUncompletedLevel = firstQuest?.levels.find(l => !completedLevelsForQuest.includes(l.id));
          setActiveLevel(firstUncompletedLevel || null);
        }

      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
  }, [userProfile.id, userProfile.gameProgress]); // Refetch if userProfile gameProgress changes directly from outside

  // Handle building click (start/continue quest level)
  const handleQuestBuildingClick = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    setActiveQuest(quest);
    // Find the first uncompleted level for this quest
    const completedLevelsForQuest = currentGameProgress.completedLevels[questId] || [];
    const nextLevel = quest.levels.find(level => !completedLevelsForQuest.includes(level.id));

    if (nextLevel) {
      setActiveLevel(nextLevel);
      // Immediately save current quest and level to progress
      const updatedProgress = {
        ...currentGameProgress,
        currentQuestId: questId,
        currentLevelId: nextLevel.id,
      };
      gameService.updateGameProgress(updatedProgress).then(p => {
        setCurrentGameProgress(p);
        setUserProfile(prev => prev ? { ...prev, gameProgress: p } : null);
      });
      // Clear previous mentor messages for new task
      setMentorMessages([]);
    } else {
      // All levels in this quest completed
      alert(`You have completed all levels in ${quest.name}!`);
      setActiveLevel(null);
      // Consider unlocking next quest here
      const nextQuestIndex = quests.findIndex(q => q.id === questId) + 1;
      if (nextQuestIndex < quests.length && !currentGameProgress.unlockedQuests.includes(quests[nextQuestIndex].id)) {
        const nextQuestId = quests[nextQuestIndex].id;
        const updatedProgress = {
          ...currentGameProgress,
          unlockedQuests: [...currentGameProgress.unlockedQuests, nextQuestId],
          currentQuestId: undefined, // Reset active task
          currentLevelId: undefined,
        };
        gameService.updateGameProgress(updatedProgress).then(p => {
          setCurrentGameProgress(p);
          setUserProfile(prev => prev ? { ...prev, gameProgress: p } : null);
          alert(`Congratulations! You've unlocked a new quest: ${quests[nextQuestIndex].name}!`);
        });
      }
    }
  };

  const handleMentorSendMessage = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!userAnswer.trim() || isMentorLoading || !activeLevel) return;

    const userMsg: ChatMessage = { role: 'user', content: userAnswer.trim() };
    setMentorMessages((prev) => [...prev, userMsg]);
    setIsMentorLoading(true);
    setUserAnswer('');

    try {
      // Send user answer to AI mentor
      const aiResponse = await geminiService.sendGameMentorMessage(
        `User's answer to "${activeLevel.taskPrompt}": ${userAnswer}. Is this correct? Provide educational feedback. If correct, praise them and explain why it's correct. If incorrect, guide them gently.`,
        gameMentorSystemInstruction
      );
      setMentorMessages((prev) => [...prev, aiResponse]);

      // Simple mock validation for task completion
      const isCorrect = activeLevel.expectedAnswerKeywords?.some(keyword =>
        userAnswer.toLowerCase().includes(keyword.toLowerCase())
      ) || false;

      if (isCorrect) {
        handleLevelCompletion(activeLevel);
      } else {
        // AI feedback already handled
      }

    } catch (err: any) {
      console.error('Error in AI Mentor Chat:', err);
      setMentorMessages((prev) => [
        ...prev,
        { role: 'model', content: `Sorry, I encountered an error: ${err.message}. Please try again.` },
      ]);
    } finally {
      setIsMentorLoading(false);
    }
  };

  const handleLevelCompletion = useCallback(async (level: QuestLevel) => {
    if (!activeQuest) return;

    // Update game progress
    const updatedCompletedLevels = {
      ...currentGameProgress.completedLevels,
      [activeQuest.id]: [...(currentGameProgress.completedLevels[activeQuest.id] || []), level.id],
    };

    let updatedBadges = [...userProfile.badges];
    if (level.badgeReward && !updatedBadges.includes(level.badgeReward)) {
      updatedBadges.push(level.badgeReward);
    }

    const newGameProgress: GameProgress = {
      ...currentGameProgress,
      xp: currentGameProgress.xp + level.xpReward,
      coins: currentGameProgress.coins + level.coinReward,
      completedLevels: updatedCompletedLevels,
      currentQuestId: undefined, // Clear active task
      currentLevelId: undefined,
    };

    // Update user's overall level based on total badges/XP (simple logic)
    const newOverallLevel = updatedBadges.length + Math.floor(newGameProgress.xp / 500) + 1;

    const updatedUserProfile: UserProfile = {
      ...userProfile,
      badges: updatedBadges,
      level: newOverallLevel,
      gameProgress: newGameProgress,
    };

    try {
      const persistedProgress = await gameService.updateGameProgress(newGameProgress, userProfile.id);
      const persistedUserProfile = await userService.updateProfile(updatedUserProfile);
      setCurrentGameProgress(persistedProgress);
      setUserProfile(persistedUserProfile);

      setEarnedReward({ xp: level.xpReward, coins: level.coinReward, badge: level.badgeReward });
      setShowRewardModal(true);
      setActiveLevel(null); // Clear active level after completion

      // Check for premium trial unlock after a certain number of levels (e.g., 3 levels)
      const totalCompletedLevels = Object.values(persistedProgress.completedLevels).flat().length;
      if (totalCompletedLevels >= 3 && !userProfile.badges.includes("Premium Trial Unlocked")) { // Use a badge to prevent re-triggering
        setShowPremiumTrialModal(true);
        const updatedBadgesForPremium = [...persistedUserProfile.badges, "Premium Trial Unlocked"];
        const updatedUserProfileWithPremiumBadge = { ...persistedUserProfile, badges: updatedBadgesForPremium };
        await userService.updateProfile(updatedUserProfileWithPremiumBadge);
        setUserProfile(updatedUserProfileWithPremiumBadge);
      }

    } catch (err) {
      console.error('Error completing level:', err);
      setError('Failed to save game progress.');
    }
  }, [currentGameProgress, activeQuest, userProfile, setUserProfile]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  const currentQuestIndex = activeQuest ? quests.findIndex(q => q.id === activeQuest.id) : -1;
  const progressText = activeQuest && activeLevel
    ? `Quest: ${activeQuest.name} | Level: ${activeLevel.name}`
    : `Select a quest to begin your journey!`;

  // Generate background buildings for a realistic city feel
  const backgroundBuildings = Array.from({ length: 30 }).map((_, i) => {
    const height = Math.random() * 2 + 0.5; // Random height between 0.5 and 2.5
    const width = Math.random() * 0.5 + 0.5; // Random width between 0.5 and 1.0
    const depth = Math.random() * 0.5 + 0.5; // Random depth between 0.5 and 1.0
    const x = (Math.random() - 0.5) * 15; // Spread across x-axis
    const z = (Math.random() - 0.5) * 15; // Spread across z-axis
    const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Random hex color
    return {
      position: [x, 0, z] as [number, number, number], // Position the group at base
      color: color,
      dimensions: [width, height, depth] as [number, number, number], // Pass dimensions
    };
  });


  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl relative">
      <h2 className="text-3xl font-bold text-yellow-400 mb-4 p-6 pb-0">Business Literacy Quest</h2>

      {/* Game Progress Bar/Info */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 p-4 shadow-md flex justify-between items-center rounded-b-lg mb-6 mx-6"
      >
        <div className="flex items-center text-gray-200 text-lg">
          <StarIcon className="h-6 w-6 text-yellow-400 mr-2" />
          <span>XP: <span className="font-bold">{currentGameProgress.xp}</span></span>
          <CurrencyRupeeIcon className="h-6 w-6 text-green-400 ml-6 mr-2" />
          <span>Coins: <span className="font-bold">{currentGameProgress.coins}</span></span>
        </div>
        <span className="text-yellow-300 font-semibold">{progressText}</span>
      </motion.div>

      <div className="flex-grow grid grid-cols-3 gap-6 p-6 pt-0 overflow-hidden">
        {/* 3D City Map (Simplified) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="col-span-2 bg-gray-800 rounded-lg shadow-xl relative overflow-hidden"
        >
          <Canvas
            camera={{ position: [10, 8, 10], fov: 60 }} // Adjusted camera for better overview
            shadows
            className="w-full h-full"
          >
            <ambientLight intensity={0.5} />
            <spotLight position={[20, 20, 20]} angle={0.3} penumbra={1} castShadow />
            <pointLight position={[-10, -10, -10]} />
            <Sky
              distance={450000}
              sunPosition={[100, 20, 100]} // Simulate sun position
              inclination={0.6}
              azimuth={0.1}
            />

            {/* Ground - more urban feel */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial color="#5A5A5A" /> {/* Darker gray for road/urban ground */}
            </mesh>

            {/* Background buildings for a fuller city */}
            {backgroundBuildings.map((building, index) => (
              <BackgroundBuilding
                key={`bg-building-${index}`}
                position={building.position}
                color={building.color}
                dimensions={building.dimensions}
              />
            ))}

            {/* Buildings representing quests */}
            {quests.map((quest, index) => {
              const isUnlocked = currentGameProgress.unlockedQuests.includes(quest.id);
              const questLevels = quest.levels.map(l => l.id);
              const userCompletedLevelsForQuest = currentGameProgress.completedLevels[quest.id] || [];
              const isQuestCompleted = isUnlocked && questLevels.every(levelId => userCompletedLevelsForQuest.includes(levelId));

              const positionX = (index % 3 === 0 ? -1 : (index % 3 === 1 ? 0 : 1)) * (3 + index * 1.5); // Spread buildings out
              const positionZ = Math.floor(index / 3) * 4 - 5;
              const scale = 1 + index * 0.3; // Buildings grow with quest index

              return (
                <Building
                  key={quest.id}
                  position={[positionX, 0, positionZ]} // Position the group at base
                  color={isUnlocked ? (isQuestCompleted ? '#10B981' : '#EAB308') : '#4B5563'} // Green if completed, Golden Yellow if unlocked, Gray if locked
                  name={quest.name}
                  onClick={() => isUnlocked && handleQuestBuildingClick(quest.id)}
                  initialScale={scale}
                  isUnlocked={isUnlocked}
                  isCompleted={isQuestCompleted}
                />
              );
            })}

            <OrbitControls enableZoom enablePan />
          </Canvas>
          <div className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 text-white rounded text-sm">
            Interactive City Map (Drag to rotate, Scroll to zoom)
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-black bg-opacity-50 text-white rounded text-sm flex items-center">
            <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-yellow-400" />
            Your shop: <span className="font-bold ml-1">{currentGameProgress.xp < 500 ? 'Small Stall' : currentGameProgress.xp < 1500 ? 'Thriving Store' : 'Business Empire'}</span>
          </div>
        </motion.div>

        {/* AI Mentor & Task Panel */}
        <div className="col-span-1 flex flex-col space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800 rounded-lg shadow-xl p-4 flex-grow flex flex-col"
          >
            <h3 className="text-xl font-bold text-yellow-300 mb-4 border-b border-gray-700 pb-2 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2" /> FinWise Mentor AI
            </h3>
            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 mb-4">
              <AnimatePresence>
                {mentorMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`mb-3 p-3 rounded-lg ${
                      msg.role === 'user' ? 'bg-yellow-500 text-gray-900 self-end ml-auto' : 'bg-gray-700 text-gray-100 self-start mr-auto'
                    } max-w-[90%] text-sm`}
                  >
                    <p className="font-semibold mb-1">{msg.role === 'user' ? 'You' : 'Mentor AI'}</p>
                    <p>{msg.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isMentorLoading && <LoadingSpinner />}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleMentorSendMessage} className="flex gap-2">
              <Input
                id="mentor-input"
                type="text"
                placeholder="Your answer or question..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="flex-grow"
                disabled={isMentorLoading || !activeLevel}
              />
              <Button type="submit" isLoading={isMentorLoading} disabled={!userAnswer.trim() || !activeLevel}>
                Send
              </Button>
            </form>
          </motion.div>

          {activeLevel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="bg-gray-800 rounded-lg shadow-xl p-4 flex flex-col"
            >
              <h4 className="text-xl font-bold text-yellow-400 mb-3 flex items-center">
                <TrophyIcon className="h-5 w-5 mr-2" /> Current Task: {activeLevel.name}
              </h4>
              <p className="text-gray-300 text-sm mb-4">{activeLevel.description}</p>
              <p className="text-gray-200 mb-4 p-3 bg-gray-700 rounded-md">
                <span className="font-semibold text-yellow-300">Your Challenge:</span> {activeLevel.taskPrompt}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-300">
                <span>XP Reward: <span className="font-bold text-yellow-400">{activeLevel.xpReward}</span></span>
                <span>Coins: <span className="font-bold text-green-400">{activeLevel.coinReward}</span></span>
                {activeLevel.badgeReward && (
                  <span className="flex items-center">Badge: <span className="font-bold text-purple-300 ml-1">{activeLevel.badgeReward}</span></span>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && earnedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: -100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              className="bg-gray-800 p-8 rounded-lg shadow-2xl text-center max-w-md w-full relative"
            >
              <button
                onClick={() => setShowRewardModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h3 className="text-3xl font-extrabold text-green-400 mb-4">Level Complete! 🎉</h3>
              <p className="text-gray-300 text-lg mb-2">You earned:</p>
              <div className="flex justify-center items-center gap-6 text-xl mb-4">
                <span className="flex items-center text-yellow-400"><StarIcon className="h-6 w-6 mr-2" /> {earnedReward.xp} XP</span>
                <span className="flex items-center text-green-400"><CurrencyRupeeIcon className="h-6 w-6 mr-2" /> {earnedReward.coins} Coins</span>
              </div>
              {earnedReward.badge && (
                <p className="text-yellow-300 text-lg mb-4 flex items-center justify-center">
                  <TrophyIcon className="h-6 w-6 mr-2 text-purple-400" /> New Badge: <span className="font-bold ml-2">{earnedReward.badge}</span>!
                </p>
              )}
              <Button onClick={() => setShowRewardModal(false)} className="mt-4">
                Continue Quest
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Trial Unlock Modal */}
      <AnimatePresence>
        {showPremiumTrialModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, y: -100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
              className="bg-yellow-900 p-8 rounded-lg shadow-2xl text-center max-w-lg w-full relative border-2 border-yellow-400"
            >
              <button
                onClick={() => setShowPremiumTrialModal(false)}
                className="absolute top-4 right-4 text-yellow-300 hover:text-white"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h3 className="text-4xl font-extrabold text-yellow-400 mb-4">✨ Premium Trial Unlocked! ✨</h3>
              <p className="text-yellow-200 text-lg mb-6">
                Congratulations! You've mastered several foundational levels and earned a{' '}
                <span className="font-bold text-white">7-day FinWise Premium Trial!</span>
              </p>
              <p className="text-yellow-100 mb-6">
                Unlock advanced features like: <br />
                <span className="font-semibold text-white">AI-Powered Business Coach, Auto Budget Planning, Real-time Goal Tracking, and Voice AI Chat.</span>
              </p>
              <Button onClick={() => setShowPremiumTrialModal(false)} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900">
                Explore Premium Features
              </Button>
              <p className="text-yellow-300 text-sm mt-4">Enjoy your enhanced FinWise journey!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessLiteracyQuest;