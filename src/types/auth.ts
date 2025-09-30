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

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  active: boolean;
  preferences?: UserPrefs;
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
