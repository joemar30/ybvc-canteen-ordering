import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  avatar?: string; // base64 data URL, stored per-user in localStorage
  // camelCase (frontend types)
  loyaltyPoints?: number;
  totalSpent?: number;
  tier?: string;
  // snake_case (from DB/API)
  loyalty_points?: number;
  total_spent?: number;
  created_at?: string;
  createdAt?: string;
}

type Customer = User & { role: 'customer' };
type Admin = User & { role: 'admin' };

interface AuthContextType {
  currentUser: (Customer | Admin) | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateAvatar: (base64: string) => void;
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
        // Restore avatar from per-user localStorage key
        const savedAvatar = localStorage.getItem(`avatar_${user.id}`);
        if (savedAvatar) user.avatar = savedAvatar;
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const user = await response.json();
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const register = async (email: string, password: string, name: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const user = await response.json();
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  // Persist avatar in a separate localStorage key (keeps currentUser small)
  const updateAvatar = (base64: string) => {
    if (!currentUser) return;
    const key = `avatar_${currentUser.id}`;
    if (base64) {
      localStorage.setItem(key, base64);
    } else {
      localStorage.removeItem(key);
    }
    const updated = { ...currentUser, avatar: base64 || undefined };
    setCurrentUser(updated as any);
    // Persist user record (without avatar blob, to keep it lean)
    const { avatar: _avatar, ...userWithoutAvatar } = updated as any;
    localStorage.setItem('currentUser', JSON.stringify(userWithoutAvatar));
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, register, logout, updateAvatar }}>
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
