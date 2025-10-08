'use client';

import ThemeToggle from '@/components/ui/ThemeToggle';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { resolvedTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 transition-colors">
      <div className="flex items-center h-16">
        
        {/* Logo Section - Fixed width matching sidebar */}
        <div className="w-64 h-full bg-white dark:bg-[#FFDF5E] flex items-center justify-center px-4 border-r border-gray-200 dark:border-gray-700 transition-colors">
          {/* Logo - Changes based on theme */}
          {mounted && (
            <Image
              src={resolvedTheme === 'dark' ? '/images/nbs-logo-dark theme.jpg' : '/images/nbs logo.png'}
              alt="NBS Logo"
              width={140}
              height={56}
              className="object-contain transition-opacity duration-300"
              style={{ width: 'auto', height: '56px' }}
              priority
            />
          )}
        </div>

        {/* Rest of Header Content */}
        <div className="flex-1 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Title Section */}
          <div className="flex items-center space-x-3">
            {/* Cube Icon */}
            <div className="flex items-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-10 h-10 text-black-600 dark:text-black-400 flex-shrink-0 transition-colors">
                <path fillRule="evenodd" d="M9.638 1.093a.75.75 0 0 1 .724 0l2 1.104a.75.75 0 1 1-.724 1.313L10 2.607l-1.638.903a.75.75 0 1 1-.724-1.313l2-1.104ZM5.403 4.287a.75.75 0 0 1-.295 1.019l-.805.444.805.444a.75.75 0 0 1-.724 1.314L3.5 7.02v.73a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 1 .388-.657l1.996-1.1a.75.75 0 0 1 1.019.294Zm9.194 0a.75.75 0 0 1 1.02-.295l1.995 1.101A.75.75 0 0 1 18 5.75v2a.75.75 0 0 1-1.5 0v-.73l-.884.488a.75.75 0 1 1-.724-1.314l.806-.444-.806-.444a.75.75 0 0 1-.295-1.02ZM7.343 8.284a.75.75 0 0 1 1.02-.294L10 8.893l1.638-.903a.75.75 0 1 1 .724 1.313l-1.612.89v1.557a.75.75 0 0 1-1.5 0v-1.557l-1.612-.89a.75.75 0 0 1-.295-1.019ZM2.75 11.5a.75.75 0 0 1 .75.75v1.557l1.608.887a.75.75 0 0 1-.724 1.314l-1.996-1.101A.75.75 0 0 1 2 14.25v-2a.75.75 0 0 1 .75-.75Zm14.5 0a.75.75 0 0 1 .75.75v2a.75.75 0 0 1-.388.657l-1.996 1.1a.75.75 0 1 1-.724-1.313l1.608-.887V12.25a.75.75 0 0 1 .75-.75Zm-7.25 4a.75.75 0 0 1 .75.75v.73l.888-.49a.75.75 0 0 1 .724 1.313l-2 1.104a.75.75 0 0 1-.724 0l-2-1.104a.75.75 0 1 1 .724-1.313l.888.49v-.73a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                CMS
              </h1>
              <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 transition-colors">
                Contract Management System
              </p>
            </div>
          </div>

          {/* Right side - Theme toggle and User info */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />

            {user && (
              <>
                <span className="hidden sm:block text-sm text-gray-700 dark:text-gray-300 transition-colors">
                  Welcome, {user.name || user.username || user.email || 'User'}
                </span>
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                  <span className="text-white text-sm font-medium">
                    {(user.name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="hidden sm:block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}