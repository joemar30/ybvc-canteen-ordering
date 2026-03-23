import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Admin, User } from '@/lib/types';
import { DEMO_USERS, SAMPLE_PRODUCTS, PICKUP_SLOTS, BLOG_POSTS } from '@/lib/seedData';

interface AuthContextType {
  currentUser: (Customer | Admin) | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<(Customer | Admin) | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }

    // Initialize seed data if not present
    initializeSeedData();
  }, []);

  const initializeSeedData = () => {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify(DEMO_USERS));
    }
    if (!localStorage.getItem('products')) {
      localStorage.setItem('products', JSON.stringify(SAMPLE_PRODUCTS));
    }
    if (!localStorage.getItem('pickupSlots')) {
      localStorage.setItem('pickupSlots', JSON.stringify(PICKUP_SLOTS));
    }
    if (!localStorage.getItem('blogPosts')) {
      localStorage.setItem('blogPosts', JSON.stringify(BLOG_POSTS));
    }
    if (!localStorage.getItem('orders')) {
      localStorage.setItem('orders', JSON.stringify([]));
    }
  };

  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Create customer or admin object with additional fields
    let authenticatedUser: Customer | Admin;

    if (user.role === 'customer') {
      authenticatedUser = {
        ...user,
        role: 'customer',
        loyaltyPoints: 0,
        totalSpent: 0,
        tier: 'Bronze' as const,
      };
    } else {
      authenticatedUser = {
        ...user,
        role: 'admin',
      };
    }

    setCurrentUser(authenticatedUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
  };

  const register = async (email: string, password: string, name: string) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];

    if (users.some((u) => u.email === email)) {
      throw new Error('Email already registered');
    }

    const newUser: Customer = {
      id: `customer-${Date.now()}`,
      email,
      password,
      name,
      role: 'customer',
      createdAt: new Date().toISOString(),
      loyaltyPoints: 0,
      totalSpent: 0,
      tier: 'Bronze',
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
