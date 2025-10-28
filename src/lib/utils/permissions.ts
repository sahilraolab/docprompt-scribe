// src/lib/utils/permissions.ts
import { Role } from '@/types';

export const PERMISSIONS = {
  ENGINEERING_VIEW: ['Admin', 'ProjectManager', 'Viewer'],
  ENGINEERING_CREATE: ['Admin', 'ProjectManager'],
  ENGINEERING_EDIT: ['Admin', 'ProjectManager'],
  ENGINEERING_DELETE: ['Admin', 'ProjectManager'],

  PURCHASE_VIEW: ['Admin', 'ProjectManager', 'PurchaseOfficer', 'Viewer'],
  PURCHASE_CREATE: ['Admin', 'PurchaseOfficer'],
  PURCHASE_EDIT: ['Admin', 'PurchaseOfficer'],
  PURCHASE_DELETE: ['Admin'],
  PURCHASE_APPROVE: ['Admin', 'ProjectManager', 'Approver'],

  CONTRACTS_VIEW: ['Admin', 'ProjectManager', 'Viewer'],
  CONTRACTS_CREATE: ['Admin', 'ProjectManager'],
  CONTRACTS_EDIT: ['Admin', 'ProjectManager'],
  CONTRACTS_DELETE: ['Admin', 'ProjectManager'],
  CONTRACTS_APPROVE: ['Admin', 'ProjectManager', 'Approver'],

  SITE_VIEW: ['Admin', 'ProjectManager', 'SiteEngineer', 'Viewer'],
  SITE_CREATE: ['Admin', 'SiteEngineer'],
  SITE_EDIT: ['Admin', 'SiteEngineer'],
  SITE_DELETE: ['Admin'],

  ACCOUNTS_VIEW: ['Admin', 'Accountant', 'Viewer'],
  ACCOUNTS_CREATE: ['Admin', 'Accountant'],
  ACCOUNTS_EDIT: ['Admin', 'Accountant'],
  ACCOUNTS_DELETE: ['Admin'],
  ACCOUNTS_APPROVE: ['Admin', 'Approver'],

  WORKFLOW_VIEW: ['Admin', 'Approver', 'Viewer'],
  WORKFLOW_APPROVE: ['Admin', 'Approver'],
  WORKFLOW_CONFIG: ['Admin'],

  ADMIN_VIEW: ['Admin'],
  ADMIN_USERS: ['Admin'],
  ADMIN_AUDIT: ['Admin'],
} as const;

/**
 * UI → Backend action mapping
 */
export const ACTION_MAP: Record<string, string> = {
  View: 'Read',
  Create: 'Create',
  Edit: 'Update',
  Delete: 'Delete',
  Approve: 'Approve',
  Config: 'Reject', // Config on UI means Reject backend (adjust if needed)
};

/**
 * Convert static role permissions into structured { module, actions } array.
 */
export const getRoleModulePermissions = (userRole: Role) => {
  const grouped: Record<string, string[]> = {};

  Object.entries(PERMISSIONS).forEach(([permissionKey, roles]) => {
    if ((roles as Role[]).includes(userRole)) {
      const [module, action] = permissionKey.split('_');
      const formattedModule =
        module.charAt(0).toUpperCase() + module.slice(1).toLowerCase();
      const formattedAction =
        action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();

      if (!grouped[formattedModule]) grouped[formattedModule] = [];
      if (!grouped[formattedModule].includes(formattedAction))
        grouped[formattedModule].push(formattedAction);
    }
  });

  return Object.entries(grouped).map(([module, actions]) => ({
    module,
    actions,
  }));
};
