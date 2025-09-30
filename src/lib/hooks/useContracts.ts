import { useQuery } from '@tanstack/react-query';
import { Contractor, WO } from '@/types';

async function fetchContractors(): Promise<Contractor[]> {
  const response = await fetch('/api/contractors');
  if (!response.ok) throw new Error('Failed to fetch contractors');
  const data = await response.json();
  return data.data;
}

async function fetchWorkOrders(): Promise<WO[]> {
  const response = await fetch('/api/work-orders');
  if (!response.ok) throw new Error('Failed to fetch work orders');
  const data = await response.json();
  return data.data;
}

export function useContractors() {
  return useQuery({
    queryKey: ['contractors'],
    queryFn: fetchContractors,
  });
}

export function useWorkOrders() {
  return useQuery({
    queryKey: ['work-orders'],
    queryFn: fetchWorkOrders,
  });
}
