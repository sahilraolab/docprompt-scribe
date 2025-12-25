// src/lib/utils/permissions.ts

/**
 * Check if user has at least one required permission
 * User permissions are string[] like ["admin.view", "purchase.create"]
 */
export function hasAnyPermission(
  userPermissions: string[] = [],
  required?: string[]
): boolean {
  if (!required || required.length === 0) return true;
  return required.some(p => userPermissions.includes(p));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(
  userPermissions: string[] = [],
  required: string[] = []
): boolean {
  return required.every(p => userPermissions.includes(p));
}

/**
 * Human-readable labels for permission modules
 */
export const MODULE_LABELS: Record<string, string> = {
  admin: 'Administration',
  masters: 'Master Data',
  engineering: 'Engineering',
  purchase: 'Purchase',
  inventory: 'Inventory',
  site: 'Site',
  contracts: 'Contracts',
  accounts: 'Accounts',
  workflow: 'Workflow',
  mis: 'MIS & Reports',
  tax: 'Taxation',
  statutory: 'Statutory',
};

/**
 * Human-readable labels for permission actions
 */
export const ACTION_LABELS: Record<string, string> = {
  view: 'View',
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  approve: 'Approve',
  issue: 'Issue',
  post: 'Post',
  report: 'Reports',
  action: 'Actions',
  manage: 'Manage',
  audit: 'Audit',
};

/**
 * Parse permission keys into grouped format
 * "admin.users.manage" => { module: "admin", submodule: "users", action: "manage" }
 */
export function parsePermissionKey(key: string): {
  module: string;
  submodule?: string;
  action: string;
} {
  const parts = key.split('.');
  if (parts.length === 3) {
    return { module: parts[0], submodule: parts[1], action: parts[2] };
  }
  return { module: parts[0], action: parts[1] || 'view' };
}

/**
 * Group permissions by module for display
 */
export function groupPermissionsByModule(permissions: string[]): Record<string, string[]> {
  const grouped: Record<string, Set<string>> = {};

  permissions.forEach(perm => {
    const { module, action } = parsePermissionKey(perm);
    if (!grouped[module]) grouped[module] = new Set();
    grouped[module].add(action);
  });

  const result: Record<string, string[]> = {};
  Object.entries(grouped).forEach(([module, actions]) => {
    result[module] = Array.from(actions);
  });

  return result;
}

/**
 * Role name suggestions based on first letter typed
 */
export const ROLE_SUGGESTIONS: Record<string, string[]> = {
  S: ['SUPER_ADMIN', 'SITE_ENGINEER', 'SITE_SUPERVISOR', 'STORE_KEEPER'],
  A: ['ADMIN', 'ACCOUNTANT', 'ACCOUNTS_MANAGER', 'APPROVER'],
  P: ['PROJECT_MANAGER', 'PURCHASE_OFFICER', 'PLANNING_ENGINEER'],
  E: ['ENGINEER', 'EXECUTIVE'],
  M: ['MANAGER', 'MIS_OFFICER'],
  C: ['CONTRACTS_MANAGER', 'CLERK'],
  V: ['VIEWER'],
  Q: ['QC_ENGINEER', 'QA_MANAGER'],
};

/**
 * Get all role suggestions for dropdown
 */
export function getAllRoleSuggestions(): string[] {
  const all = new Set<string>();
  Object.values(ROLE_SUGGESTIONS).flat().forEach(r => all.add(r));
  return Array.from(all).sort();
}

/**
 * Get role suggestions based on typed input
 */
export function getRoleSuggestions(input: string): string[] {
  if (!input) return getAllRoleSuggestions();
  
  const firstChar = input.charAt(0).toUpperCase();
  const suggestions = ROLE_SUGGESTIONS[firstChar] || [];
  
  return suggestions.filter(r => 
    r.toLowerCase().includes(input.toLowerCase())
  );
}
