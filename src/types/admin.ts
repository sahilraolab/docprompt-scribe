// Admin module types matching backend models

export interface Permission {
  id: number;
  key: string;
  module: string;
  action: string;
  description?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  roleId?: number;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
}

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
  meta?: Record<string, unknown>;
  createdAt: string;
}

// Role suggestion type based on user type
export type UserType = 'S' | 'E' | 'M' | 'A' | 'C';

export interface RoleSuggestion {
  userType: UserType;
  label: string;
  suggestions: string[];
}

// Permission groups for display
export interface PermissionGroup {
  module: string;
  label: string;
  permissions: Permission[];
}

// Form validation types
export interface CreateUserFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: number;
}

export interface UpdateUserFormData {
  name: string;
  phone: string;
  isActive: boolean;
  roleId: number;
}

export interface CreateRoleFormData {
  name: string;
  description?: string;
  userType?: UserType;
}
