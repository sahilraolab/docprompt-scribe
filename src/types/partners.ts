import { ID, AuditMeta } from './common';

export type PartnerType = 'Individual' | 'Company';

export interface Partner extends AuditMeta {
  id: ID;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  type: PartnerType;
  pan?: string;
  gst?: string;
  address?: string;
  active: boolean;
}

export interface ProjectInvestment extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  partnerId: ID;
  partnerName?: string;
  sharePercent: number;
  preferredReturnPercent: number;
  totalContributions: number;
  totalDistributions: number;
  active: boolean;
}

export type ProfitEventStatus = 'Draft' | 'Approved' | 'Distributed';

export interface ProfitEvent extends AuditMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  periodFrom: string;
  periodTo: string;
  profitAmount: number;
  note?: string;
  status: ProfitEventStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Distribution extends AuditMeta {
  id: ID;
  profitEventId: ID;
  investmentId: ID;
  projectId: ID;
  projectName?: string;
  partnerId: ID;
  partnerName?: string;
  periodFrom: string;
  periodTo: string;
  amount: number;
  reference?: string;
}
