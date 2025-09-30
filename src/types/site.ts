import { ID, AuditMeta, ApprovalMeta } from './common';

export interface Item {
  id: ID;
  name: string;
  code: string;
  sku?: string;
  uom: string;
  category: string;
  minQty?: number;
  currentStock?: number;
}

export interface Stock {
  id: ID;
  itemId: ID;
  itemName?: string;
  location: string;
  projectId?: ID;
  projectName?: string;
  qty: number;
  minQty?: number;
  value?: number;
}

export interface GRN extends AuditMeta, ApprovalMeta {
  id: ID;
  code: string;
  poId: ID;
  poCode?: string;
  receivedAt: string;
  items: GRNItem[];
  qcStatus: 'Pending' | 'Pass' | 'Fail';
  status: 'Draft' | 'Received' | 'Inspected';
}

export interface GRNItem {
  id: ID;
  itemId: ID;
  itemName?: string;
  qty: number;
  receivedQty: number;
  uom: string;
  remarks?: string;
}

export interface Issue extends AuditMeta {
  id: ID;
  code: string;
  projectId: ID;
  projectName?: string;
  itemId: ID;
  itemName?: string;
  qty: number;
  uom: string;
  issuedTo: ID;
  issuedToName?: string;
  issuedAt: string;
  purpose?: string;
}

export interface Transfer extends AuditMeta, ApprovalMeta {
  id: ID;
  code: string;
  itemId: ID;
  itemName?: string;
  fromLoc: string;
  fromProjectId?: ID;
  toLoc: string;
  toProjectId?: ID;
  qty: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Completed';
}

export interface QC extends AuditMeta {
  id: ID;
  code: string;
  projectId: ID;
  projectName?: string;
  itemId: ID;
  itemName?: string;
  grnId?: ID;
  result: 'Pass' | 'Fail';
  remarks?: string;
  date: string;
  inspectedBy: ID;
  inspectedByName?: string;
}
