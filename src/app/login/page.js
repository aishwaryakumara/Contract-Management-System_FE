'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Call the actual backend API
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data.success) {
        const userData = response.data.data.user;
        const token = response.data.data.token;
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update AuthContext
        updateUser(userData);
        
        // Show success animation
        setShowSuccess(true);
        toast.success('Login successful!', {
          icon: '✅',
        });
        
        // Redirect to home after animation
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        // Handle error from backend
        const errorMessage = response.data?.message || 'Invalid credentials';
        setError(errorMessage);
        setIsLoading(false);
        toast.error(errorMessage, {
          icon: '❌',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please try again.');
      setIsLoading(false);
      toast.error('Connection error. Please check if the backend is running.', {
        icon: '⚠️',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4 animate-fadeIn">
      <div className="max-w-md w-full animate-slideUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/nbs logo.png"
              alt="NBS Logo"
              width={120}
              height={48}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contract Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to continue
          </p>

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-700 dark:to-indigo-800 rounded-lg p-6 animate-scaleIn shadow-lg">
              <div className="flex items-center justify-center mb-3">
                <div className="relative w-16 h-16">
                  {/* Outer rotating ring */}
                  <div className="absolute inset-0 rounded-full border-3 border-white/30"></div>
                  <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-white animate-spin-slow"></div>
                  
                  {/* Inner checkmark */}
                  <div className="absolute inset-2 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white text-center mb-1">Welcome Back!</h2>
              <p className="text-white/80 text-center text-sm">Taking you to your dashboard...</p>
            </div>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         hover:border-gray-400 dark:hover:border-gray-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         hover:border-gray-400 dark:hover:border-gray-500"
                placeholder="Enter password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-shake">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg
                       transition-all duration-200 shadow-sm hover:shadow-md
                       disabled:opacity-70 disabled:cursor-not-allowed
                       transform hover:scale-[1.02] active:scale-[0.98]
                       flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-3">
              Use your backend credentials to login
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3 text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Enter the email and password from your backend
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
