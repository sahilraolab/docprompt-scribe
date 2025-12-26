// Default permission templates per role type
export const ROLE_PERMISSION_DEFAULTS: Record<string, string[]> = {
  // ---- ADMIN ----
  ADMIN: [
    'admin.view',
    'admin.users.view',
    'admin.roles.view',
    'admin.audit.view',
  ],

  SUPER_ADMIN: [
    '*', // special marker → full access
  ],

  SYSTEM_ADMIN: [
    'admin.view',
    'admin.users.manage',
    'admin.roles.manage',
    'admin.audit.view',
  ],

  // ---- ENGINEERING ----
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

  // ---- SITE ----
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

  // ---- PURCHASE ----
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

  // ---- ACCOUNTS ----
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

  // ---- WORKFLOW ----
  WORKFLOW_MANAGER: [
    'workflow.view',
    'workflow.action',
  ],
};
