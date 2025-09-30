import { User } from '@/types';

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@erp.local',
    phone: '+91 98765 43210',
    role: 'Admin',
    avatarUrl: undefined,
    active: true,
    preferences: {
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      numberFormat: 'short',
      theme: 'dark',
    },
  },
  {
    id: 'user-2',
    name: 'Rajesh Kumar',
    email: 'pm@erp.local',
    phone: '+91 98765 43211',
    role: 'ProjectManager',
    active: true,
    preferences: {
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      numberFormat: 'short',
    },
  },
  {
    id: 'user-3',
    name: 'Priya Sharma',
    email: 'po@erp.local',
    phone: '+91 98765 43212',
    role: 'PurchaseOfficer',
    active: true,
    preferences: {
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      numberFormat: 'short',
    },
  },
  {
    id: 'user-4',
    name: 'Amit Patel',
    email: 'se@erp.local',
    phone: '+91 98765 43213',
    role: 'SiteEngineer',
    active: true,
    preferences: {
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      numberFormat: 'short',
    },
  },
  {
    id: 'user-5',
    name: 'Sunita Reddy',
    email: 'acc@erp.local',
    phone: '+91 98765 43214',
    role: 'Accountant',
    active: true,
    preferences: {
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      numberFormat: 'short',
    },
  },
  {
    id: 'user-6',
    name: 'Vikram Singh',
    email: 'apr@erp.local',
    phone: '+91 98765 43215',
    role: 'Approver',
    active: true,
    preferences: {
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      numberFormat: 'short',
    },
  },
];

export const findUserByEmail = (email: string) =>
  users.find((u) => u.email === email);

export const findUserById = (id: string) => users.find((u) => u.id === id);
