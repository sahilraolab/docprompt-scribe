import { ID, AuditMeta } from './common';

export interface WorkflowConfig extends AuditMeta {
  id: ID;
  module: string;
  entity: string;
  name: string;
  levels: WorkflowLevel[];
  slaHours?: number;
  active: boolean;
}

export interface WorkflowLevel {
  id: ID;
  level: number;
  role: string; // Role name
  threshold?: number;
  escalateToRole?: string;
  escalateAfterHours?: number;
}

export interface ApprovalRequest extends AuditMeta {
  id: ID;
  workflowId: ID;
  entityType: string;
  entityId: ID;
  entityCode?: string;
  currentLevel: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedBy: ID;
  submittedByName?: string;
  approvedBy?: ID;
  approvedByName?: string;
  approvedAt?: string;
  remarks?: string;
  dueAt?: string;
  overdue: boolean;
}

export interface ApprovalHistory {
  id: ID;
  approvalId: ID;
  level: number;
  actorId: ID;
  actorName: string;
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Escalated';
  remarks?: string;
  timestamp: string;
}

export interface SLAConfig extends AuditMeta {
  id: ID;
  module: string;
  entity: string;
  slaHours: number;
  escalateRole?: string;
  notifyRoles: string[];
  active: boolean;
}
