import React, { useState } from 'react';
import { authService } from '../services/api';
import Button from './Button';
import Input from './Input';
import { UserProfile } from '../types';

interface SignupProps {
  onSignupSuccess: () => void;
  onNavigateToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupSuccess, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState<number>(0);
  const [profession, setProfession] = useState('');
  const [city, setCity] = useState('');
  const [financialGoal, setFinancialGoal] = useState('Early Retirement');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (age <= 0) {
        setError('Please enter a valid age.');
        return;
    }

    setIsLoading(true);
    try {
      const newUserProfile: Omit<UserProfile, 'id' | 'badges' | 'level' | 'gameProgress'> & { password: string } = {
        email,
        password,
        name,
        age,
        profession,
        city,
        income: 0, // Default for now, can be updated later
        financialGoal,
      };
      const user = await authService.register(newUserProfile);
      if (user) {
        onSignupSuccess();
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-6">FinWise AI</h2>
        <p className="text-center text-gray-400 mb-8">Create your account</p>
        <form onSubmit={handleSubmit}>
          <Input
            id="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Input
            id="age"
            label="Age"
            type="number"
            placeholder="25"
            value={age === 0 ? '' : age}
            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
            min="18"
            required
          />
          <Input
            id="profession"
            label="Profession"
            type="text"
            placeholder="Software Engineer"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            required
          />
          <Input
            id="city"
            label="City"
            type="text"
            placeholder="Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <div className="mb-4">
            <label htmlFor="financialGoal" className="block text-gray-300 text-sm font-bold mb-2">
              Primary Financial Goal
            </label>
            <select
              id="financialGoal"
              value={financialGoal}
              onChange={(e) => setFinancialGoal(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 bg-gray-700 text-gray-200 leading-tight focus:outline-none focus:shadow-outline focus:border-yellow-500"
            >
              <option value="Early Retirement">Early Retirement</option>
              <option value="Buying a House">Buying a House</option>
              <option value="Child's Education">Child's Education</option>
              <option value="Tax Savings">Tax Savings</option>
              <option value="Emergency Fund">Emergency Fund</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign Up
          </Button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-yellow-400 hover:text-yellow-300 font-semibold focus:outline-none"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;