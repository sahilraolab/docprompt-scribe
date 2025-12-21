import { ID, Currency } from './common';

export type Role =
  | 'Admin'
  | 'ProjectManager'
  | 'PurchaseOfficer'
  | 'SiteEngineer'
  | 'Accountant'
  | 'Approver'
  | 'Viewer';

export interface UserPrefs {
  timezone: string;
  currency: Currency;
  numberFormat: 'short' | 'full';
  theme?: 'light' | 'dark';
}

export interface UserPermission {
  module: string;
  actions: string[];
}

export interface User {
  id: ID;
  _id?: string; // MongoDB ObjectId from backend
  name: string;
  email: string;
  phone?: string;
  role: Role;
  department?: 'Engineering' | 'Purchase' | 'Site' | 'Accounts' | 'Contracts' | 'Admin';
  avatarUrl?: string;
  active: boolean;
  preferences?: UserPrefs;
  permissions?: UserPermission[];
  createdAt?: string;
  updatedAt?: string;
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
