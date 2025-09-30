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
  {
    id: 'apr-2',
    workflowId: 'wf-2',
    entityType: 'WO',
    entityId: 'wo-1',
    entityCode: 'WO-2024-001',
    currentLevel: 1,
    status: 'Pending',
    submittedBy: 'user-4',
    submittedByName: 'Amit Kumar',
    dueAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago (overdue)
    overdue: true,
    createdBy: 'user-4',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: 'apr-3',
    workflowId: 'wf-1',
    entityType: 'PO',
    entityId: 'po-2',
    entityCode: 'PO-2024-005',
    currentLevel: 1,
    status: 'Approved',
    submittedBy: 'user-3',
    submittedByName: 'Priya Sharma',
    approvedBy: 'user-2',
    approvedByName: 'Rajesh Kumar',
    approvedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    remarks: 'Approved as per budget allocation',
    dueAt: new Date(Date.now() - 86400000).toISOString(),
    overdue: false,
    createdBy: 'user-3',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  },
  {
    id: 'apr-4',
    workflowId: 'wf-1',
    entityType: 'PO',
    entityId: 'po-3',
    entityCode: 'PO-2024-008',
    currentLevel: 1,
    status: 'Pending',
    submittedBy: 'user-5',
    submittedByName: 'Sneha Patel',
    dueAt: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
    overdue: false,
    createdBy: 'user-5',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
];
