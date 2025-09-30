import { Role } from '@/types';

/**
 * Role-based access control utilities
 */

export const PERMISSIONS = {
  // Engineering permissions
  ENGINEERING_VIEW: ['Admin', 'ProjectManager', 'Viewer'],
  ENGINEERING_CREATE: ['Admin', 'ProjectManager'],
  ENGINEERING_EDIT: ['Admin', 'ProjectManager'],
  ENGINEERING_DELETE: ['Admin', 'ProjectManager'],
  
  // Purchase permissions
  PURCHASE_VIEW: ['Admin', 'ProjectManager', 'PurchaseOfficer', 'Viewer'],
  PURCHASE_CREATE: ['Admin', 'PurchaseOfficer'],
  PURCHASE_EDIT: ['Admin', 'PurchaseOfficer'],
  PURCHASE_DELETE: ['Admin'],
  PURCHASE_APPROVE: ['Admin', 'ProjectManager', 'Approver'],
  
  // Contracts permissions
  CONTRACTS_VIEW: ['Admin', 'ProjectManager', 'Viewer'],
  CONTRACTS_CREATE: ['Admin', 'ProjectManager'],
  CONTRACTS_EDIT: ['Admin', 'ProjectManager'],
  CONTRACTS_DELETE: ['Admin', 'ProjectManager'],
  CONTRACTS_APPROVE: ['Admin', 'ProjectManager', 'Approver'],
  
  // Site permissions
  SITE_VIEW: ['Admin', 'ProjectManager', 'SiteEngineer', 'Viewer'],
  SITE_CREATE: ['Admin', 'SiteEngineer'],
  SITE_EDIT: ['Admin', 'SiteEngineer'],
  SITE_DELETE: ['Admin'],
  
  // Accounts permissions
  ACCOUNTS_VIEW: ['Admin', 'Accountant', 'Viewer'],
  ACCOUNTS_CREATE: ['Admin', 'Accountant'],
  ACCOUNTS_EDIT: ['Admin', 'Accountant'],
  ACCOUNTS_DELETE: ['Admin'],
  ACCOUNTS_APPROVE: ['Admin', 'Approver'],
  
  // Workflow permissions
  WORKFLOW_VIEW: ['Admin', 'Approver', 'Viewer'],
  WORKFLOW_APPROVE: ['Admin', 'Approver'],
  WORKFLOW_CONFIG: ['Admin'],
  
  // Admin permissions
  ADMIN_VIEW: ['Admin'],
  ADMIN_USERS: ['Admin'],
  ADMIN_AUDIT: ['Admin'],
} as const;

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (
  userRole: Role,
  permission: keyof typeof PERMISSIONS
): boolean => {
  return (PERMISSIONS[permission] as readonly Role[]).includes(userRole);
};

/**
 * Check if user can view a module
 */
export const canView = (userRole: Role, module: string): boolean => {
  const permissionKey = `${module.toUpperCase()}_VIEW` as keyof typeof PERMISSIONS;
  return hasPermission(userRole, permissionKey);
};

/**
 * Check if user can create in a module
 */
export const canCreate = (userRole: Role, module: string): boolean => {
  const permissionKey = `${module.toUpperCase()}_CREATE` as keyof typeof PERMISSIONS;
  return hasPermission(userRole, permissionKey);
};

/**
 * Check if user can edit in a module
 */
export const canEdit = (userRole: Role, module: string): boolean => {
  const permissionKey = `${module.toUpperCase()}_EDIT` as keyof typeof PERMISSIONS;
  return hasPermission(userRole, permissionKey);
};

/**
 * Check if user can delete in a module
 */
export const canDelete = (userRole: Role, module: string): boolean => {
  const permissionKey = `${module.toUpperCase()}_DELETE` as keyof typeof PERMISSIONS;
  return hasPermission(userRole, permissionKey);
};

/**
 * Check if user can approve in a module
 */
export const canApprove = (userRole: Role, module: string): boolean => {
  const permissionKey = `${module.toUpperCase()}_APPROVE` as keyof typeof PERMISSIONS;
  return hasPermission(userRole, permissionKey);
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (userRole: Role): string[] => {
  return Object.entries(PERMISSIONS)
    .filter(([_, roles]) => (roles as readonly Role[]).includes(userRole))
    .map(([permission]) => permission);
};

/**
 * Check if role is admin
 */
export const isAdmin = (userRole: Role): boolean => {
  return userRole === 'Admin';
};

/**
 * Check if role can manage users
 */
export const canManageUsers = (userRole: Role): boolean => {
  return isAdmin(userRole);
};

/**
 * Check if role can view audit logs
 */
export const canViewAudit = (userRole: Role): boolean => {
  return userRole === 'Admin';
};
