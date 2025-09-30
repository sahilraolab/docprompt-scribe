import { ID, AuditMeta } from './common';

export type AccountType = 'Asset' | 'Liability' | 'Income' | 'Expense' | 'Equity';

export interface Account extends AuditMeta {
  id: ID;
  code: string;
  name: string;
  type: AccountType;
  parentId?: ID;
  parentName?: string;
  level: number;
  balance: number;
  active: boolean;
}

export interface Journal extends AuditMeta {
  id: ID;
  code: string;
  date: string;
  type: 'General' | 'Payment' | 'Receipt' | 'Contra' | 'Journal';
  entries: JournalEntry[];
  totalDebit: number;
  totalCredit: number;
  narration?: string;
  status: 'Draft' | 'Posted' | 'Cancelled';
  projectId?: ID;
  projectName?: string;
}

export interface JournalEntry {
  id: ID;
  accountId: ID;
  accountName?: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface Ledger {
  accountId: ID;
  accountName: string;
  entries: LedgerEntry[];
  openingBalance: number;
  closingBalance: number;
}

export interface LedgerEntry {
  id: ID;
  date: string;
  particulars: string;
  voucherNo: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface FinancialReport {
  id: string;
  type: 'BalanceSheet' | 'ProfitLoss' | 'TrialBalance' | 'CashFlow';
  fromDate: string;
  toDate: string;
  data: any;
  generatedAt: string;
}

export interface CostCentre extends AuditMeta {
  id: ID;
  code: string;
  name: string;
  type: 'Project' | 'Department' | 'Branch';
  active: boolean;
}

export interface TaxConfig extends AuditMeta {
  id: ID;
  name: string;
  type: 'GST' | 'WCT' | 'TDS';
  rate: number;
  effectiveFrom: string;
  active: boolean;
}
