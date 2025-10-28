import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { Contractor, WO, RABill, LabourRate } from '@/types';

const API_BASE = '/contracts/contractors';

// ✅ ----------- FETCH FUNCTIONS -----------
async function fetchContractors(): Promise<Contractor[]> {
  const data = await apiClient.request(`${API_BASE}`, { method: 'GET' });
  return data.data;
}

async function fetchContractor(id: string): Promise<Contractor> {
  const data = await apiClient.request(`${API_BASE}/${id}`, { method: 'GET' });
  return data.data;
}

async function fetchWorkOrders(): Promise<WO[]> {
  const data = await apiClient.request('/api/work-orders', { method: 'GET' });
  return data.data;
}

async function fetchWorkOrder(id: string): Promise<WO> {
  const data = await apiClient.request(`/api/work-orders/${id}`, { method: 'GET' });
  return data.data;
}

async function fetchRABills(): Promise<RABill[]> {
  const data = await apiClient.request('/api/ra-bills', { method: 'GET' });
  return data.data;
}

async function fetchLabourRates(): Promise<LabourRate[]> {
  const data = await apiClient.request('/api/labour-rates', { method: 'GET' });
  return data.data;
}

// ✅ ----------- QUERIES -----------
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

// ✅ ----------- MUTATIONS -----------

// Create Contractor
export function useCreateContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Contractor>) => {
      const data = await apiClient.request(API_BASE, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
    },
  });
}

// Update Contractor
export function useUpdateContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<Contractor> }) => {
      const data = await apiClient.request(`${API_BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
    },
  });
}

// Delete Contractor
export function useDeleteContractor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.request(`${API_BASE}/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
    },
  });
}
