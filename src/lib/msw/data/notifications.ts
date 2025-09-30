import { Notification } from '@/types';

export const notifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'Approval',
    title: 'PO Approval Required',
    message: 'Purchase Order PO-2024-001 requires your approval',
    entityType: 'PO',
    entityId: 'po-1',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    actionUrl: '/purchase/pos/po-1',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'Info',
    title: 'Project Update',
    message: 'Skyline Towers reached 45% completion',
    entityType: 'Project',
    entityId: 'proj-1',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    actionUrl: '/engineering/projects/proj-1',
  },
];
