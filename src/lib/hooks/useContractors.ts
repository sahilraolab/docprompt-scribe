import { useQuery } from '@tanstack/react-query';
import { Contractor, WO, RABill, LabourRate } from '@/types';

async function fetchContractors(): Promise<Contractor[]> {
  const response = await fetch('/api/contractors');
  if (!response.ok) throw new Error('Failed to fetch contractors');
  const data = await response.json();
  return data.data;
}

async function fetchContractor(id: string): Promise<Contractor> {
  const response = await fetch(`/api/contractors/${id}`);
  if (!response.ok) throw new Error('Failed to fetch contractor');
  return response.json();
}

async function fetchWorkOrders(): Promise<WO[]> {
  const response = await fetch('/api/work-orders');
  if (!response.ok) throw new Error('Failed to fetch work orders');
  const data = await response.json();
  return data.data;
}

async function fetchWorkOrder(id: string): Promise<WO> {
  const response = await fetch(`/api/work-orders/${id}`);
  if (!response.ok) throw new Error('Failed to fetch work order');
  return response.json();
}

async function fetchRABills(): Promise<RABill[]> {
  const response = await fetch('/api/ra-bills');
  if (!response.ok) throw new Error('Failed to fetch RA bills');
  const data = await response.json();
  return data.data;
}

async function fetchLabourRates(): Promise<LabourRate[]> {
  const response = await fetch('/api/labour-rates');
  if (!response.ok) throw new Error('Failed to fetch labour rates');
  const data = await response.json();
  return data.data;
}

export function useContractors() {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: fetchContractors,
  });
}

export function useContractor(id: string) {
  return useQuery({
    queryKey: ['contractors', id],
    queryFn: () => fetchContractor(id),
    enabled: !!id,
  });
}

export function useWorkOrders() {
  return useQuery({
    queryKey: ['work-orders'],
    queryFn: fetchWorkOrders,
  });
}

export function useWorkOrder(id: string) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: () => fetchWorkOrder(id),
    enabled: !!id,
  });
}

export function useRABills() {
  return useQuery({
    queryKey: ['ra-bills'],
    queryFn: fetchRABills,
  });
}

export function useLabourRates() {
  return useQuery({
    queryKey: ['labour-rates'],
    queryFn: fetchLabourRates,
  });
}
