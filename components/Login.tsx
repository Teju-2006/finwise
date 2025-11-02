import React, { useState } from 'react';
import { authService } from '../services/api';
import Button from './Button';
import Input from './Input';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateToSignup: () => void; // New prop for navigation
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await authService.login(email, password);
      if (user) {
        onLoginSuccess();
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      const user = await authService.loginWithGoogle();
      if (user) {
        onLoginSuccess();
      } else {
        setError('Google login failed');
      }
    } catch (err) {
      setError('An error occurred during Google login.');
      console.error(err);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-yellow-400 mb-6">FinWise AI</h2>
        <p className="text-center text-gray-400 mb-8">Your intelligent financial assistant.</p>
        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="test@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Login
          </Button>
        </form>
        <div className="mt-4">
          <Button
            type="button"
            className="w-full bg-red-600 hover:bg-red-700"
            isLoading={isGoogleLoading}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
        </div>
        <p className="text-center text-gray-400 text-sm mt-4">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToSignup}
            className="text-yellow-400 hover:text-yellow-300 font-semibold focus:outline-none"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;