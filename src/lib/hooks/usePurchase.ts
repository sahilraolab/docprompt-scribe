import { useQuery } from '@tanstack/react-query';
import { Supplier, MR, PO, Quotation } from '@/types';

async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await fetch('/api/suppliers');
  if (!response.ok) throw new Error('Failed to fetch suppliers');
  const data = await response.json();
  return data.data;
}

async function fetchSupplier(id: string): Promise<Supplier> {
  const response = await fetch(`/api/suppliers/${id}`);
  if (!response.ok) throw new Error('Failed to fetch supplier');
  return response.json();
}

async function fetchMRs(): Promise<MR[]> {
  const response = await fetch('/api/mrs');
  if (!response.ok) throw new Error('Failed to fetch MRs');
  const data = await response.json();
  return data.data;
}

async function fetchPOs(): Promise<PO[]> {
  const response = await fetch('/api/pos');
  if (!response.ok) throw new Error('Failed to fetch POs');
  const data = await response.json();
  return data.data;
}

async function fetchPO(id: string): Promise<PO> {
  const response = await fetch(`/api/pos/${id}`);
  if (!response.ok) throw new Error('Failed to fetch PO');
  return response.json();
}

async function fetchQuotations(): Promise<Quotation[]> {
  const response = await fetch('/api/quotations');
  if (!response.ok) throw new Error('Failed to fetch quotations');
  const data = await response.json();
  return data.data;
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: fetchSuppliers,
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => fetchSupplier(id),
    enabled: !!id,
  });
}

export function useMRs() {
  return useQuery({
    queryKey: ['mrs'],
    queryFn: fetchMRs,
  });
}

export function usePOs() {
  return useQuery({
    queryKey: ['pos'],
    queryFn: fetchPOs,
  });
}

export function usePO(id: string) {
  return useQuery({
    queryKey: ['pos', id],
    queryFn: () => fetchPO(id),
    enabled: !!id,
  });
}

export function useQuotations() {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: fetchQuotations,
  });
}
