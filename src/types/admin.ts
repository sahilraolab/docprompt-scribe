// Admin module types matching backend models
// Re-export from auth.ts to avoid conflicts
export type { User, AuditLog, BackendRole as Role, BackendPermission as Permission } from './auth';

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
  permissions: Array<{
    id?: number;
    key: string;
    module: string;
    action: string;
    description?: string;
  }>;
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

// System permission type for frontend constants
export interface SystemPermission {
  key: string;
  module: string;
  action: string;
  description?: string;
}
