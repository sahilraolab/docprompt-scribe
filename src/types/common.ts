export type ID = string;

export type Status =
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Sent'
  | 'Received'
  | 'Closed'
  | 'Active'
  | 'Planning'
  | 'OnHold'
  | 'Completed'
  | 'Cancelled';

export type Currency = 'INR';

export interface AuditMeta {
  createdBy: ID;
  createdAt: string;
  updatedBy?: ID;
  updatedAt?: string;
}

export interface ApprovalMeta {
  required?: boolean;
  level?: number;
  approvedBy?: ID;
  approvedAt?: string;
  remarks?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
}
