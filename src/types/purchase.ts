import { ID, Status, AuditMeta, ApprovalMeta } from './common';

export interface Supplier extends AuditMeta {
  id: ID;
  name: string;
  code: string;
  contact: string;
  phone?: string;
  email?: string;
  gst?: string;
  city?: string;
  state?: string;
  rating?: number;
  active: boolean;
}

export interface MR extends AuditMeta, ApprovalMeta {
  id: ID;
  projectId: ID;
  projectName?: string;
  code: string;
  items: MRItem[];
  status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  requestedBy: ID;
  requestedByName?: string;
}

export interface MRItem {
  id: ID;
  itemId: ID;
  itemName?: string;
  description: string;
  qty: number;
  uom: string;
  requiredBy?: string;
}

export interface Quotation extends AuditMeta {
  id: ID;
  supplierId: ID;
  supplierName?: string;
  mrId: ID;
  mrCode?: string;
  expiresAt: string;
  items: QuoteItem[];
  notes?: string;
  status: Status;
}

export interface QuoteItem {
  id: ID;
  mrItemId: ID;
  description: string;
  qty: number;
  uom: string;
  rate: number;
  taxPct: number;
  amount: number;
}

export interface PO extends AuditMeta, ApprovalMeta {
  id: ID;
  code: string;
  supplierId: ID;
  supplierName?: string;
  projectId: ID;
  projectName?: string;
  items: POItem[];
  status: Status;
  total: number;
  taxTotal: number;
  grandTotal: number;
  deliveryDate?: string;
  terms?: string;
}

export interface POItem {
  id: ID;
  description: string;
  qty: number;
  uom: string;
  rate: number;
  taxPct: number;
  amount: number;
}

export interface PurchaseBill extends AuditMeta {
  id: ID;
  poId: ID;
  poCode?: string;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  tax: number;
  total: number;
  status: Status;
}

export interface ComparativeStatement extends AuditMeta {
  id: ID;
  mrId: ID;
  mrCode?: string;
  quotations: ID[];
  selectedSupplierId?: ID;
  analysis: string;
  createdBy: ID;
}
