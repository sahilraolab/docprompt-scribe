// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import type { User, LoginCredentials } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // ✅ add this
  setToken: React.Dispatch<React.SetStateAction<string | null>>; // ✅ add this
}

const AuthContext = createContext<AuthContextType | null>(null);
const USER_KEY = 'erp_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(apiClient.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = apiClient.getToken();
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem(USER_KEY);
        apiClient.setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Handle session expiration globally
  useEffect(() => {
    const handleApiError = (event: CustomEvent<{ error: Error }>) => {
      const err = event.detail.error;
      if ((err as any).code === 'SESSION_EXPIRED') {
        toast.error('Session expired, please log in again.');
        logout();
      }
    };
    window.addEventListener('api-error', handleApiError as EventListener);
    return () => window.removeEventListener('api-error', handleApiError as EventListener);
  }, []);

  // Auto-refresh access token if possible
  useEffect(() => {
    const tryRestore = async () => {
      if (!user && token) {
        try {
          const data = await apiClient.request('/auth/refresh', { method: 'POST' });
          const newToken = data?.token || data?.accessToken;
          if (newToken) {
            apiClient.setToken(newToken);
            setToken(newToken);
          }
        } catch {
          // Token refresh failed - clear invalid token
          apiClient.setToken(null);
          setToken(null);
          localStorage.removeItem(USER_KEY);
        }
      }
    };
    tryRestore();
  }, []);

  // LOGIN
  const login = async (credentials: LoginCredentials) => {
    try {
      const res = await fetch(`${apiClient.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      
      // Check for error response
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Login failed');
      }

      // Handle multiple response formats:
      // { token, user } - your backend format
      // { accessToken, user } - alternative format
      // { data: { token, user } } - wrapped format
      const authToken = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const userData = data.user || data.data?.user;
      
      if (!authToken) {
        throw new Error('No authentication token received');
      }
      if (!userData) {
        throw new Error('No user data received');
      }

      // Normalize user object
      const normalizedUser: User = {
        ...userData,
        id: userData.id || userData._id,
        _id: userData._id || userData.id,
      };

      apiClient.setToken(authToken);
      setToken(authToken);
      setUser(normalizedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

      toast.success(`Welcome back, ${normalizedUser.name || 'User'}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg);
      throw err;
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await apiClient.request('/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    } finally {
      apiClient.setToken(null);
      setToken(null);
      setUser(null);
      localStorage.removeItem(USER_KEY);
      toast.info('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUser,  // ✅ expose to consumers
        setToken, // ✅ expose to consumers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
