import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../api/client';
import { storage } from '../utils/storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateOnboarding: (data: any) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getToken();
      const storedUser = await storage.getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }
    } catch (e) {
      console.warn('Failed to restore auth session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      await storage.setToken(receivedToken);
      await storage.setUser(receivedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post('/auth/register', data);
      const { token: receivedToken, user: receivedUser } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      await storage.setToken(receivedToken);
      await storage.setUser(receivedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboarding = async (data: any) => {
    const res = await apiClient.put('/auth/onboarding', data);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    await storage.setUser(updatedUser);
  };

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data.user) {
        setUser(res.data.user);
        await storage.setUser(res.data.user);
      }
    } catch (err) {
      console.warn('Error refreshing profile:', err);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await storage.clearAll();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
        updateOnboarding,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
