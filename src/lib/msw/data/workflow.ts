import { WorkflowConfig, ApprovalRequest } from '@/types';

export const workflowConfigs: WorkflowConfig[] = [
  {
    id: 'wf-1',
    module: 'Purchase',
    entity: 'PO',
    name: 'Purchase Order Approval',
    levels: [
      {
        id: 'wfl-1',
        level: 1,
        role: 'PurchaseOfficer',
        threshold: 500000,
      },
      {
        id: 'wfl-2',
        level: 2,
        role: 'Approver',
        threshold: 5000000,
      },
    ],
    slaHours: 24,
    active: true,
    createdBy: 'user-1',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'wf-2',
    module: 'Contracts',
    entity: 'WO',
    name: 'Work Order Approval',
    levels: [
      {
        id: 'wfl-3',
        level: 1,
        role: 'ProjectManager',
        threshold: 1000000,
      },
      {
        id: 'wfl-4',
        level: 2,
        role: 'Approver',
      },
    ],
    slaHours: 48,
    active: true,
    createdBy: 'user-1',
    createdAt: '2024-01-01T10:00:00Z',
  },
];

export const approvalRequests: ApprovalRequest[] = [
  {
    id: 'apr-1',
    workflowId: 'wf-1',
    entityType: 'PO',
    entityId: 'po-1',
    entityCode: 'PO-2024-001',
    currentLevel: 2,
    status: 'Pending',
    submittedBy: 'user-3',
    submittedByName: 'Priya Sharma',
    dueAt: new Date(Date.now() + 43200000).toISOString(), // 12 hours from now
    overdue: false,
    createdBy: 'user-3',
    createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
  },
];
