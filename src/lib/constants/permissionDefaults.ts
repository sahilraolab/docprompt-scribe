// permissionDefaults.ts

export const ROLE_PERMISSION_DEFAULTS: Record<string, string[]> = {
  ADMIN: [
    'admin.view',
    'admin.users.view',
    'admin.roles.view',
    'admin.audit.view',
  ],

  SUPER_ADMIN: ['*'],

  SYSTEM_ADMIN: [
    'admin.view',
    'admin.users.manage',
    'admin.roles.manage',
    'admin.audit.view',
  ],

  ENGINEER: [
    'engineering.view',
    'engineering.create',
    'engineering.update',
  ],

  SENIOR_ENGINEER: [
    'engineering.view',
    'engineering.create',
    'engineering.update',
    'engineering.approve',
  ],

  SITE_ENGINEER: [
    'site.view',
    'site.create',
    'site.update',
    'site.issue',
  ],

  SITE_MANAGER: [
    'site.view',
    'site.create',
    'site.update',
    'site.approve',
  ],

  PURCHASE_OFFICER: [
    'purchase.view',
    'purchase.create',
    'purchase.update',
  ],

  PROCUREMENT_MANAGER: [
    'purchase.view',
    'purchase.create',
    'purchase.update',
    'purchase.approve',
  ],

  ACCOUNTANT: [
    'accounts.view',
    'accounts.create',
    'accounts.post',
  ],

  ACCOUNTS_MANAGER: [
    'accounts.view',
    'accounts.create',
    'accounts.post',
    'accounts.report',
  ],

  WORKFLOW_MANAGER: [
    'workflow.view',
    'workflow.action',
  ],
};
