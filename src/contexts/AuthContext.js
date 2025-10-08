'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

// Dummy credentials for testing
const DUMMY_USERS = [
  { username: 'user', password: 'user123@#$', role: 'user', name: 'Test User' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      // Don't redirect while showing success animation
      if (!user && pathname !== '/login') {
        // Not logged in and not on login page -> redirect to login
        router.push('/login');
      } else if (user && pathname === '/login' && !showSuccess) {
        // Logged in and on login page -> redirect to home
        // But only if we're not showing success animation
        router.push('/');
      }
    }
  }, [user, pathname, loading, router, showSuccess]);

  const login = (username, password) => {
    // Find matching user
    const foundUser = DUMMY_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      // Show success animation
      console.log('Setting showSuccess to true');
      setShowSuccess(true);
      
      // Navigate after animation (2 seconds for better UX)
      setTimeout(() => {
        console.log('Navigating to home');
        router.push('/');
        setTimeout(() => {
          console.log('Hiding success overlay');
          setShowSuccess(false);
        }, 500);
      }, 2000);
      
      return { success: true };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Method to update user after backend login
  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, showSuccess, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
