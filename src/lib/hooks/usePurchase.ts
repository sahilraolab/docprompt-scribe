import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Supplier, MR, PO, Quotation } from '@/types';
import { toast } from 'sonner';

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

async function fetchMaterialRates() {
  const response = await fetch('/api/material-rates');
  if (!response.ok) throw new Error('Failed to fetch material rates');
  const data = await response.json();
  return data.data;
}

async function fetchMaterialRate(id: string) {
  const response = await fetch(`/api/material-rates/${id}`);
  if (!response.ok) throw new Error('Failed to fetch material rate');
  return response.json();
}

export function useMaterialRates() {
  return useQuery({
    queryKey: ['material-rates'],
    queryFn: fetchMaterialRates,
  });
}

export function useMaterialRate(id: string) {
  return useQuery({
    queryKey: ['material-rates', id],
    queryFn: () => fetchMaterialRate(id),
    enabled: !!id,
  });
}

// Mutation hooks for CRUD operations

// Suppliers
export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: () => {
      toast.error('Failed to create supplier');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Supplier> }) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier updated successfully');
    },
    onError: () => {
      toast.error('Failed to update supplier');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete supplier');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete supplier');
    },
  });
}

// Material Requisitions
export function useCreateMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<MR>) => {
      const response = await fetch('/api/mrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create MR');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('MR created successfully');
    },
    onError: () => {
      toast.error('Failed to create MR');
    },
  });
}

export function useUpdateMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MR> }) => {
      const response = await fetch(`/api/mrs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update MR');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('MR updated successfully');
    },
    onError: () => {
      toast.error('Failed to update MR');
    },
  });
}

// Purchase Orders
export function useCreatePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<PO>) => {
      const response = await fetch('/api/pos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create PO');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('PO created successfully');
    },
    onError: () => {
      toast.error('Failed to create PO');
    },
  });
}

export function useUpdatePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PO> }) => {
      const response = await fetch(`/api/pos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update PO');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('PO updated successfully');
    },
    onError: () => {
      toast.error('Failed to update PO');
    },
  });
}

// Quotations
export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Quotation>) => {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create quotation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created successfully');
    },
    onError: () => {
      toast.error('Failed to create quotation');
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Quotation> }) => {
      const response = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update quotation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation updated successfully');
    },
    onError: () => {
      toast.error('Failed to update quotation');
    },
  });
}

// Material Rates
export function useCreateMaterialRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/material-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create material rate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-rates'] });
      toast.success('Material rate created successfully');
    },
    onError: () => {
      toast.error('Failed to create material rate');
    },
  });
}

export function useUpdateMaterialRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/material-rates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update material rate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-rates'] });
      toast.success('Material rate updated successfully');
    },
    onError: () => {
      toast.error('Failed to update material rate');
    },
  });
}
