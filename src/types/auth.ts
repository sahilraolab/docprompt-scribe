import { ID, Currency } from './common';

// Backend Role model
export interface BackendRole {
  id: number;
  name: string;
  description?: string;
  permissions?: BackendPermission[];
}

// Backend Permission model
export interface BackendPermission {
  id: number;
  key: string;
  module: string;
  action: string;
  description?: string;
}

export interface UserPrefs {
  timezone: string;
  currency: Currency;
  numberFormat: 'short' | 'full';
  theme?: 'light' | 'dark';
}

// Backend User model (matches user.model.js)
export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role?: BackendRole; // Populated from belongsTo(Role)
  roleId?: number;
  isActive: boolean;
  permissions?: string[]; // Flat array of permission keys from login response
  createdAt?: string;
  updatedAt?: string;
}

// Backend AuditLog model
export interface AuditLog {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  action: string;
  module: string;
  recordId?: number;
  meta?: Record<string, any>;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// MSW mock user type (for local development only)
export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department?: string;
  avatarUrl?: string;
  active: boolean;
  preferences?: UserPrefs;
}
