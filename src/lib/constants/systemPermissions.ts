export const SYSTEM_PERMISSIONS = [
  // ADMIN
  { key: 'admin.create', module: 'ADMIN', action: 'Create' },
  { key: 'admin.update', module: 'ADMIN', action: 'Update' },
  { key: 'admin.view', module: 'ADMIN', action: 'View' },
  { key: 'admin.delete', module: 'ADMIN', action: 'Delete' },
  { key: 'admin.users.view', module: 'ADMIN', action: 'View Users' },
  { key: 'admin.roles.view', module: 'ADMIN', action: 'View Roles' },
  { key: 'admin.audit.view', module: 'ADMIN', action: 'View Audit Logs' },

  // ENGINEERING
  { key: 'engineering.create', module: 'ENGINEERING', action: 'Create' },
  { key: 'engineering.update', module: 'ENGINEERING', action: 'Update' },
  { key: 'engineering.approve', module: 'ENGINEERING', action: 'Approve' },
  { key: 'engineering.view', module: 'ENGINEERING', action: 'View' },

  // SITE
  { key: 'site.create', module: 'SITE', action: 'Create' },
  { key: 'site.update', module: 'SITE', action: 'Update' },
  { key: 'site.approve', module: 'SITE', action: 'Approve' },
  { key: 'site.issue', module: 'SITE', action: 'Issue' },
  { key: 'site.view', module: 'SITE', action: 'View' },

  // PURCHASE
  { key: 'purchase.create', module: 'PURCHASE', action: 'Create' },
  { key: 'purchase.update', module: 'PURCHASE', action: 'Update' },
  { key: 'purchase.approve', module: 'PURCHASE', action: 'Approve' },
  { key: 'purchase.view', module: 'PURCHASE', action: 'View' },

  // ACCOUNTS
  { key: 'accounts.create', module: 'ACCOUNTS', action: 'Create' },
  { key: 'accounts.post', module: 'ACCOUNTS', action: 'Post' },
  { key: 'accounts.view', module: 'ACCOUNTS', action: 'View' },
  { key: 'accounts.report', module: 'ACCOUNTS', action: 'Report' },

  // WORKFLOW
  { key: 'workflow.action', module: 'WORKFLOW', action: 'Action' },
  { key: 'workflow.view', module: 'WORKFLOW', action: 'View' },
];
