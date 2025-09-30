import { WO, RABill, Advance, LabourRate } from '@/types';

export const workOrders: WO[] = [
  {
    id: 'wo-1',
    code: 'WO-2024-001',
    contractorId: 'con-1',
    contractorName: 'Shapoorji Pallonji & Co',
    projectId: 'proj-1',
    projectName: 'Skyline Towers',
    scope: 'Structural work for floors 11-20',
    startDate: '2024-11-01',
    endDate: '2025-04-30',
    amount: 50000000, // ₹5 Cr
    spent: 5000000,
    status: 'Active',
    approvalStatus: 'Approved',
    revision: 1,
    progress: 10,
    approvedBy: 'user-6',
    approvedAt: '2024-10-25T10:00:00Z',
    createdBy: 'user-2',
    createdAt: '2024-10-20T10:00:00Z',
  },
];

export const raBills: RABill[] = [];

export const advances: Advance[] = [
  {
    id: 'adv-1',
    contractorId: 'con-1',
    contractorName: 'Shapoorji Pallonji & Co',
    woId: 'wo-1',
    woCode: 'WO-2024-001',
    amount: 5000000, // ₹50 L
    paidAt: '2024-11-01',
    balance: 5000000,
    status: 'Active',
    createdBy: 'user-5',
    createdAt: '2024-11-01T10:00:00Z',
  },
];

export const labourRates: LabourRate[] = [
  {
    id: 'lr-1',
    skill: 'Mason',
    category: 'Skilled',
    rate: 800,
    uom: 'Day',
    effectiveFrom: '2024-01-01',
    createdBy: 'user-2',
    createdAt: '2023-12-15T10:00:00Z',
  },
  {
    id: 'lr-2',
    skill: 'Helper',
    category: 'Unskilled',
    rate: 500,
    uom: 'Day',
    effectiveFrom: '2024-01-01',
    createdBy: 'user-2',
    createdAt: '2023-12-15T10:00:00Z',
  },
  {
    id: 'lr-3',
    skill: 'Carpenter',
    category: 'Skilled',
    rate: 850,
    uom: 'Day',
    effectiveFrom: '2024-01-01',
    createdBy: 'user-2',
    createdAt: '2023-12-15T10:00:00Z',
  },
];
