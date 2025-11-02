export interface UserProfile {
  id: string;
  name: string;
  age: number;
  income: number;
  financialGoal: string;
  badges: string[];
  level: number;
  profession: string; // Added for Real-India Income Tracker
  city: string; // Added for Real-India Income Tracker
  email: string; // Added for registration consistency
  gameProgress?: GameProgress; // New: Gamification progress
}

export interface Scheme {
  name: string;
  interestRate: number;
  lockInPeriod: string;
  description: string;
  eligibility: string[];
}

export interface BudgetEntry {
  id: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SchemeRecommendation {
  Scheme: string;
  Reason: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

// New types for Debt Trap Decoder
export interface LoanDetails {
  principal: number;
  monthlyInterestRate: number; // as a percentage, e.g., 2 for 2%
  tenureMonths: number;
}

export interface LoanAmortization {
  month: number;
  beginningBalance: number;
  payment: number;
  interestPaid: number;
  principalPaid: number;
  endingBalance: number;
}

// New types for Real-India Income & Inflation Tracker
export interface CityCostData {
  city: string;
  tier: 'Tier 1' | 'Tier 2';
  averageRent: number;
  foodCost: number;
  transportCost: number;
  miscellaneous: number;
  starterSalaryRange: { min: number; max: number };
}

export interface ProfessionSalary {
  profession: string;
  averageMonthlyIncome: number;
}

// New types for Informal Economy Financial Planner
export interface InformalIncomeEntry {
  date: string;
  amount: number;
  frequency: 'daily' | 'weekly';
}

// New types for Business Literacy Quest (Gamification)
export interface GameProgress {
  level: number;
  xp: number;
  coins: number;
  unlockedQuests: string[]; // IDs of quests that are unlocked
  completedLevels: { [questId: string]: string[] }; // { 'quest1Id': ['level1Id', 'level2Id'] }
  currentQuestId?: string; // The quest the user is currently playing
  currentLevelId?: string; // The level the user is currently on
}

export interface QuestLevel {
  id: string;
  name: string;
  description: string;
  taskPrompt: string; // AI will use this for the task
  xpReward: number;
  coinReward: number;
  badgeReward?: string; // Optional badge awarded for completing this level
  expectedAnswerKeywords?: string[]; // Simple keywords for mock validation
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  levels: QuestLevel[];
}