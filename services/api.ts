import { UserProfile, Scheme, BudgetEntry, SchemeRecommendation, CityCostData, ProfessionSalary, GameProgress, Quest, QuestLevel } from '../types';

// JSON Server base URL
const API_BASE_URL = 'http://localhost:3001';

// Current user state
let currentUser: UserProfile | null = null;

// Mock data for schemes, budget, etc. (keeping these as they are not user-specific auth)

const MOCK_SCHEMES: Scheme[] = [
  {
    name: 'Public Provident Fund (PPF)',
    interestRate: 7.1,
    lockInPeriod: '15 years',
    description: 'A long-term investment scheme offering tax benefits and guaranteed returns.',
    eligibility: ['Indian citizens'],
  },
  {
    name: 'National Pension System (NPS)',
    interestRate: 9.0, // Varies based on market
    lockInPeriod: 'Till 60 years',
    description: 'A voluntary retirement savings scheme for building a retirement corpus.',
    eligibility: ['Indian citizens, aged 18-70'],
  },
  {
    name: 'National Savings Certificate (NSC)',
    interestRate: 7.7,
    lockInPeriod: '5 years',
    description: 'A fixed-income investment scheme that provides tax savings under Section 80C.',
    eligibility: ['Indian citizens'],
  },
  {
    name: 'Kisan Vikas Patra (KVP)',
    interestRate: 7.5,
    lockInPeriod: '120 months (10 years)',
    description: 'A small savings scheme that doubles the money invested in a specified period.',
    eligibility: ['Adult Indian citizens, Joint accounts also possible'],
  },
];

const MOCK_BUDGET: BudgetEntry[] = [
  { id: 'b1', category: 'Salary', amount: 75000, type: 'income', date: '2023-10-01' },
  { id: 'b2', category: 'Rent', amount: 18000, type: 'expense', date: '2023-10-05' },
  { id: 'b3', category: 'Groceries', amount: 6000, type: 'expense', date: '2023-10-07' },
  { id: 'b4', category: 'Utilities', amount: 3000, type: 'expense', date: '2023-10-10' },
  { id: 'b5', category: 'Transport', amount: 2500, type: 'expense', date: '2023-10-12' },
  { id: 'b6', category: 'Entertainment', amount: 4000, type: 'expense', date: '2023-10-15' },
  { id: 'b7', category: 'Investments', amount: 15000, type: 'expense', date: '2023-10-20' },
  { id: 'b8', category: 'Freelance', amount: 10000, type: 'income', date: '2023-10-25' },
];

const MOCK_CITY_COST_DATA: CityCostData[] = [
  {
    city: 'Mumbai',
    tier: 'Tier 1',
    averageRent: 25000, // 1BHK in decent area
    foodCost: 8000,
    transportCost: 3000,
    miscellaneous: 7000,
    starterSalaryRange: { min: 20000, max: 40000 },
  },
  {
    city: 'Bengaluru',
    tier: 'Tier 1',
    averageRent: 20000,
    foodCost: 7000,
    transportCost: 2500,
    miscellaneous: 6000,
    starterSalaryRange: { min: 25000, max: 50000 },
  },
  {
    city: 'Delhi',
    tier: 'Tier 1',
    averageRent: 22000,
    foodCost: 7500,
    transportCost: 2800,
    miscellaneous: 6500,
    starterSalaryRange: { min: 20000, max: 45000 },
  },
  {
    city: 'Pune',
    tier: 'Tier 2',
    averageRent: 12000,
    foodCost: 5000,
    transportCost: 1800,
    miscellaneous: 4000,
    starterSalaryRange: { min: 15000, max: 30000 },
  },
  {
    city: 'Jaipur',
    tier: 'Tier 2',
    averageRent: 8000,
    foodCost: 4000,
    transportCost: 1200,
    miscellaneous: 3000,
    starterSalaryRange: { min: 10000, max: 25000 },
  },
];

const MOCK_PROFESSION_SALARIES: ProfessionSalary[] = [
  { profession: 'Software Engineer', averageMonthlyIncome: 60000 },
  { profession: 'Marketing Specialist', averageMonthlyIncome: 40000 },
  { profession: 'Graphic Designer', averageMonthlyIncome: 35000 },
  { profession: 'Teacher', averageMonthlyIncome: 30000 },
  { profession: 'Freelancer', averageMonthlyIncome: 45000 }, // Highly variable
  { profession: 'Retail Associate', averageMonthlyIncome: 18000 },
];

const MOCK_QUESTS: Quest[] = [
  {
    id: 'business-quest-1',
    name: 'Startup Foundations',
    description: 'Learn the basics of running a small business profitably.',
    levels: [
      {
        id: 'level-1-1',
        name: 'Income vs. Profit',
        description: 'Understand the difference between your total earnings and what you actually keep.',
        taskPrompt: 'Your small chai stall made ₹2000 today. Your expenses for tea leaves, milk, sugar, and cups were ₹800. What was your profit for the day? Explain why profit is different from income.',
        xpReward: 50,
        coinReward: 100,
        badgeReward: 'Profit Pro',
        expectedAnswerKeywords: ['profit', 'income', 'expenses', 'difference', 'chai'],
      },
      {
        id: 'level-1-2',
        name: 'GST Basics',
        description: 'Learn how Goods and Services Tax (GST) applies to your business.',
        taskPrompt: 'You sold a handmade craft item for ₹500, and the GST rate is 18%. How much GST do you need to collect from the customer and how much is your net revenue? Why is it important to track GST?',
        xpReward: 75,
        coinReward: 150,
        badgeReward: 'Tax Tally',
        expectedAnswerKeywords: ['GST', 'tax', 'collect', 'net revenue', 'track'],
      },
      {
        id: 'level-1-3',
        name: 'Setting Prices & Margins',
        description: 'Discover how to price your products effectively to ensure good profit margins.',
        taskPrompt: 'You run a small tailoring business. The cost of materials and labor for a custom dress is ₹1200. You want a 40% profit margin. What should be your selling price? Explain your calculation.',
        xpReward: 100,
        coinReward: 200,
        badgeReward: 'Pricing Pro',
        expectedAnswerKeywords: ['selling price', 'cost', 'profit margin', 'calculate', 'tailoring'],
      },
      {
        id: 'level-1-4',
        name: 'Investing Small Profits',
        description: 'Learn how to make your small profits grow with smart, low-risk investments.',
        taskPrompt: 'You have ₹5000 surplus profit from your kirana store this month. Instead of keeping it as cash, suggest a simple, safe way to invest it in India. What are the benefits?',
        xpReward: 125,
        coinReward: 250,
        badgeReward: 'Smart Saver',
        expectedAnswerKeywords: ['invest', 'profit', 'small savings', 'FD', 'RD', 'benefits'],
      },
      {
        id: 'level-1-5',
        name: 'Hiring & Scaling',
        description: 'Understand the financial implications of hiring and expanding your business.',
        taskPrompt: 'Your online snack business is growing, and you need to hire an assistant. Their monthly salary is ₹15000. Besides salary, what other potential costs should you consider when hiring in India? How does hiring affect your cash flow?',
        xpReward: 150,
        coinReward: 300,
        badgeReward: 'Growth Guru',
        expectedAnswerKeywords: ['hiring', 'salary', 'costs', 'ESI', 'PF', 'cash flow', 'scaling'],
      },
    ],
  },
  {
    id: 'business-quest-2',
    name: 'Advanced Business Strategy',
    description: 'Master advanced concepts for growth, risk management, and financial planning.',
    levels: [
      {
        id: 'level-2-1',
        name: 'Cashflow Forecasting',
        description: 'Predict your future cash flow to avoid shortages.',
        taskPrompt: 'Your business has seasonal sales. How can you forecast your cash flow for the next 6 months to ensure you always have enough money to pay suppliers and staff, even in slow periods?',
        xpReward: 150,
        coinReward: 300,
        badgeReward: 'Forecasting Wiz',
        expectedAnswerKeywords: ['cash flow', 'forecast', 'seasonal', 'planning', 'shortages'],
      },
      {
        id: 'level-2-2',
        name: 'Managing Credit & Debt',
        description: 'Learn to responsibly offer credit to customers and manage business loans.',
        taskPrompt: 'Many kirana stores offer credit to loyal customers. What are the risks of this, and what strategies can you implement to manage customer credit effectively without harming your business? Also, when should a business consider taking a loan?',
        xpReward: 175,
        coinReward: 350,
        badgeReward: 'Debt Decipherer',
        expectedAnswerKeywords: ['credit', 'debt', 'risk', 'management', 'loan', 'kirana'],
      },
    ],
  },
];

export const authService = {
  login: async (email: string, password: string): Promise<UserProfile | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users?email=${email}&password=${password}`);
      const users = await response.json();
      if (users.length > 0) {
        currentUser = users[0];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return currentUser;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  loginWithGoogle: async (): Promise<UserProfile | null> => {
    // For now, redirect to Google OAuth or simulate
    // This would need proper OAuth implementation
    console.log('Google login not implemented yet');
    return null;
  },

  register: async (userData: Omit<UserProfile, 'id' | 'badges' | 'level' | 'gameProgress'> & { password: string }): Promise<UserProfile | null> => {
    try {
      const { password, ...userDataWithoutPassword } = userData;
      const newUser: UserProfile = {
        ...userDataWithoutPassword,
        id: Date.now().toString(),
        badges: ['Newbie Navigator'],
        level: 1,
        gameProgress: {
          level: 1,
          xp: 0,
          coins: 0,
          unlockedQuests: ['business-quest-1'],
          completedLevels: {},
        }
      };

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newUser, password }),
      });

      if (response.ok) {
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return newUser;
      }
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  },

  logout: async () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
  },

  isAuthenticated: (): boolean => {
    return currentUser !== null || !!localStorage.getItem('currentUser');
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    if (currentUser) return currentUser;

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
    return null;
  },

  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => {
    // Simple implementation - in a real app this would listen to auth changes
    const checkAuth = () => {
      const user = currentUser || JSON.parse(localStorage.getItem('currentUser') || 'null');
      callback(user);
    };

    // Check immediately
    checkAuth();

    // Return unsubscribe function
    return () => {};
  }
};

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      return currentUser;
    }
    throw new Error('User not authenticated');
  },
  updateProfile: async (profile: UserProfile): Promise<UserProfile> => {
    if (profile.id) {
      const response = await fetch(`${API_BASE_URL}/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        currentUser = profile;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return profile;
      }
    }
    throw new Error('User not authenticated or update failed');
  }
};

export const schemesService = {
  getGovernmentSchemes: async (): Promise<Scheme[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_SCHEMES;
  },
  // This would be replaced by actual AI call in geminiService
  getRecommendedSchemes: async (userProfile: UserProfile): Promise<SchemeRecommendation[]> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Mocking AI response based on a simple rule
    if (userProfile.financialGoal.toLowerCase().includes('retirement')) {
      return [
        { Scheme: 'NPS', Reason: 'Excellent for long-term retirement planning with tax benefits.' },
        { Scheme: 'PPF', Reason: 'Guaranteed returns and tax-free maturity, good for a secure retirement corpus.' },
        { Scheme: 'Senior Citizen Savings Scheme (SCSS)', Reason: 'High interest and regular income post-retirement (if applicable later).' },
      ];
    } else if (userProfile.financialGoal.toLowerCase().includes('tax')) {
      return [
        { Scheme: 'PPF', Reason: 'E-E-E (Exempt-Exempt-Exempt) status for tax savings.' },
        { Scheme: 'NSC', Reason: 'Tax deduction under Section 80C.' },
        { Scheme: 'ELSS (Equity Linked Savings Scheme)', Reason: 'Tax savings with equity market exposure (higher risk, higher potential return).' },
      ];
    }
    return [
      { Scheme: 'PPF', Reason: 'A versatile scheme for various goals due to its safety and tax benefits.' },
      { Scheme: 'NSC', Reason: 'Good for shorter-term goals with fixed returns.' },
    ];
  }
};

export const budgetService = {
  getBudgetEntries: async (): Promise<BudgetEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_BUDGET;
  },
  addBudgetEntry: async (entry: Omit<BudgetEntry, 'id'>): Promise<BudgetEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newEntry: BudgetEntry = { ...entry, id: `b${MOCK_BUDGET.length + 1}` };
    MOCK_BUDGET.push(newEntry); // Simulate adding to data
    return newEntry;
  },
  updateBudgetEntry: async (updatedEntry: BudgetEntry): Promise<BudgetEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_BUDGET.findIndex(e => e.id === updatedEntry.id);
    if (index !== -1) {
      MOCK_BUDGET[index] = updatedEntry;
    }
    return updatedEntry;
  },
  deleteBudgetEntry: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const initialLength = MOCK_BUDGET.length;
    MOCK_BUDGET.splice(MOCK_BUDGET.findIndex(e => e.id === id), 1);
    return MOCK_BUDGET.length < initialLength;
  }
};

export const cityService = {
  getCityCostData: async (city: string): Promise<CityCostData | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CITY_COST_DATA.find(data => data.city === city);
  },
  getAllCities: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CITY_COST_DATA.map(data => data.city);
  },
  getProfessionSalary: async (profession: string): Promise<ProfessionSalary | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PROFESSION_SALARIES.find(data => data.profession === profession);
  },
  getAllProfessions: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PROFESSION_SALARIES.map(data => data.profession);
  }
};

export const gameService = {
  getAllQuests: async (): Promise<Quest[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/quests`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching quests:', error);
      return MOCK_QUESTS; // Fallback to mock data
    }
  },

  getQuestById: async (questId: string): Promise<Quest | undefined> => {
    try {
      const response = await fetch(`${API_BASE_URL}/quests/${questId}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching quest:', error);
    }
    return MOCK_QUESTS.find(q => q.id === questId); // Fallback
  },

  getGameProgress: async (userId?: string): Promise<GameProgress> => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser) {
      return currentUser.gameProgress;
    }
    throw new Error('User not authenticated');
  },

  updateGameProgress: async (progress: GameProgress, userId?: string): Promise<GameProgress> => {
    const currentUser = await authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      const updatedUser = { ...currentUser, gameProgress: progress };
      await userService.updateProfile(updatedUser);
      return progress;
    }
    throw new Error('User not found for game progress update.');
  },
};
