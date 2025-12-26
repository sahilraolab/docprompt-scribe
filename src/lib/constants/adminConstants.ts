import type { RoleSuggestion, UserType } from "@/types/admin";

// Role suggestions based on user type for reducing typo errors
export const ROLE_SUGGESTIONS: RoleSuggestion[] = [
  {
    userType: 'S',
    label: 'Site/Field Staff',
    suggestions: [
      'SITE_ENGINEER',
      'SITE_SUPERVISOR',
      'SITE_MANAGER',
      'SITE_COORDINATOR',
      'SURVEYOR',
      'QUALITY_INSPECTOR',
    ],
  },
  {
    userType: 'E',
    label: 'Engineering',
    suggestions: [
      'ENGINEER',
      'SENIOR_ENGINEER',
      'DESIGN_ENGINEER',
      'STRUCTURAL_ENGINEER',
      'CIVIL_ENGINEER',
      'PROJECT_ENGINEER',
    ],
  },
  {
    userType: 'M',
    label: 'Management',
    suggestions: [
      'PROJECT_MANAGER',
      'OPERATIONS_MANAGER',
      'GENERAL_MANAGER',
      'DEPARTMENT_HEAD',
      'TEAM_LEAD',
      'DIRECTOR',
    ],
  },
  {
    userType: 'A',
    label: 'Administration',
    suggestions: [
      'ADMIN',
      'SUPER_ADMIN',
      'SYSTEM_ADMIN',
      'HR_ADMIN',
      'FINANCE_ADMIN',
      'OFFICE_ADMIN',
    ],
  },
  {
    userType: 'C',
    label: 'Commercial/Accounts',
    suggestions: [
      'ACCOUNTANT',
      'ACCOUNTS_MANAGER',
      'PURCHASE_OFFICER',
      'PROCUREMENT_MANAGER',
      'BILLING_CLERK',
      'FINANCE_CONTROLLER',
    ],
  },
];

// Get suggestions for a specific user type
export function getRoleSuggestions(userType: UserType): string[] {
  const found = ROLE_SUGGESTIONS.find(r => r.userType === userType);
  return found?.suggestions || [];
}

// Get all user types with labels
export function getUserTypes(): { value: UserType; label: string }[] {
  return ROLE_SUGGESTIONS.map(r => ({
    value: r.userType,
    label: r.label,
  }));
}

// Permission modules for grouping
export const PERMISSION_MODULES = [
  { key: 'ADMIN', label: 'Administration', icon: 'Shield' },
  { key: 'ENGINEERING', label: 'Engineering', icon: 'Ruler' },
  { key: 'PURCHASE', label: 'Purchase', icon: 'ShoppingCart' },
  { key: 'CONTRACTS', label: 'Contracts', icon: 'FileText' },
  { key: 'SITE', label: 'Site Operations', icon: 'Building' },
  { key: 'ACCOUNTS', label: 'Accounts', icon: 'Calculator' },
  { key: 'WORKFLOW', label: 'Workflow', icon: 'GitBranch' },
];

// Action types for human-readable display
export const ACTION_LABELS: Record<string, string> = {
  CREATE_USER: 'Created a new user',
  UPDATE_USER: 'Updated user information',
  DELETE_USER: 'Deleted a user',
  CREATE_ROLE: 'Created a new role',
  UPDATE_ROLE: 'Updated role information',
  ASSIGN_PERMISSIONS: 'Assigned permissions to role',
  LOGIN: 'Logged into the system',
  LOGOUT: 'Logged out of the system',
  CREATE: 'Created a record',
  UPDATE: 'Updated a record',
  DELETE: 'Deleted a record',
  VIEW: 'Viewed a record',
  EXPORT: 'Exported data',
  IMPORT: 'Imported data',
  APPROVE: 'Approved a request',
  REJECT: 'Rejected a request',
};

// Module labels for human-readable display
export const MODULE_LABELS: Record<string, string> = {
  ADMIN: 'Administration',
  ENGINEERING: 'Engineering',
  PURCHASE: 'Purchase',
  CONTRACTS: 'Contracts',
  SITE: 'Site Operations',
  ACCOUNTS: 'Accounts',
  WORKFLOW: 'Workflow',
  AUTH: 'Authentication',
  SYSTEM: 'System',
};

// Format action for display
export function formatAction(action: string): string {
  return ACTION_LABELS[action] || action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Format module for display
export function formatModule(module: string): string {
  return MODULE_LABELS[module] || module.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

// Format role name for display
export function formatRoleName(role: string): string {
  return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}
