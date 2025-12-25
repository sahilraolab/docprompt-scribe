// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import type { User, LoginCredentials } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USER_KEY = "erp_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(apiClient.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Restore auth from localStorage
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

  // LOGIN
  const login = async (credentials: LoginCredentials) => {
    const res = await fetch(`${apiClient.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Login failed");
    }

    if (!data.token || !data.user) {
      throw new Error("Invalid login response");
    }

    apiClient.setToken(data.token);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    toast.success(`Welcome back, ${data.user.name}`);
    navigate("/profile");
  };

  // LOGOUT
  const logout = async () => {
    try {
      await apiClient.request("/auth/logout", { method: "POST" });
    } catch {
      /* backend failure should not block logout */
    } finally {
      apiClient.setToken(null);
      setToken(null);
      setUser(null);
      localStorage.removeItem(USER_KEY);
      toast.info("Logged out successfully");
      navigate("/login");
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
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
