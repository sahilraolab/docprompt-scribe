import { ID } from './common';

export interface Notification {
  id: ID;
  userId: ID;
  type: 'Info' | 'Success' | 'Warning' | 'Error' | 'Approval';
  title: string;
  message: string;
  entityType?: string;
  entityId?: ID;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface AuditLog {
  id: ID;
  userId: ID;
  userName: string;
  module: string;
  entityType: string;
  entityId: ID;
  action: 'Create' | 'Update' | 'Delete' | 'Approve' | 'Reject' | 'View';
  before?: any;
  after?: any;
  timestamp: string;
  ipAddress?: string;
}
