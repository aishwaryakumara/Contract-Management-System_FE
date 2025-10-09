'use client';

import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Show nothing if not authenticated (AuthProvider will redirect)
  if (!user) {
    return null;
  }

  // Render protected content with fade-in animation
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors animate-fadeIn">
      {/* Header across the top - Fixed */}
      <Header />
      
      {/* Main container with sidebar and content - Account for fixed header */}
      <div className="flex h-[calc(100vh-64px)] mt-16">
        {/* Sidebar - Fixed */}
        <div className="fixed left-0 top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar />
        </div>
        
        {/* Main content area - with left margin to account for sidebar */}
        <main className="flex-1 ml-64 px-8 py-8 overflow-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
