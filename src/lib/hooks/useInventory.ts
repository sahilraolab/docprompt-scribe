/**
 * Inventory Module Hooks
 * Aligned 1:1 with backend API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api/inventoryApi';
import { toast } from 'sonner';
import type { 
  CreateGRNRequest, 
  CreateMaterialIssueRequest, 
  CreateStockTransferRequest 
} from '@/types/inventory';

// =============== GRN Hooks ===============

export function useGRNs(params?: { projectId?: number; poId?: number; status?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['grns', params],
    queryFn: () => inventoryApi.getAllGRN(params),
    enabled: options?.enabled ?? true,
  });
}

export function useGRN(id?: number | string) {
  return useQuery({
    queryKey: ['grn', id],
    queryFn: () => inventoryApi.getGRNById(id!),
    enabled: !!id,
  });
}

export function useCreateGRN() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGRNRequest) => inventoryApi.createGRN(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('GRN created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create GRN');
    },
  });
}

export function useApproveGRN() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => inventoryApi.approveGRN(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['grn'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger'] });
      toast.success('GRN approved successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to approve GRN');
    },
  });
}

// =============== Material Issue Hooks ===============

export function useIssues(params?: { projectId?: number; status?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => inventoryApi.getAllIssues(params),
    enabled: options?.enabled ?? true,
  });
}

export function useIssue(id?: number | string) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => inventoryApi.getIssueById(id!),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaterialIssueRequest) => inventoryApi.createIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger'] });
      toast.success('Material issue created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create material issue');
    },
  });
}

export function useCancelIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => inventoryApi.cancelIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger'] });
      toast.success('Material issue cancelled - stock reversed');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel material issue');
    },
  });
}

// =============== Stock Transfer Hooks ===============

export function useTransfers(params?: { projectId?: number; status?: string }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['transfers', params],
    queryFn: () => inventoryApi.getAllTransfers(params),
    enabled: options?.enabled ?? true,
  });
}

export function useTransfer(id?: number | string) {
  return useQuery({
    queryKey: ['transfer', id],
    queryFn: () => inventoryApi.getTransferById(id!),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStockTransferRequest) => inventoryApi.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger'] });
      toast.success('Stock transfer completed successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create stock transfer');
    },
  });
}

// =============== Stock Hooks ===============

export function useStock(params?: { projectId?: number; locationId?: number; materialId?: number }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['stock', params],
    queryFn: () => inventoryApi.getStock(params),
    enabled: options?.enabled ?? true,
  });
}

// =============== Stock Ledger Hooks ===============

export function useStockLedger(params?: { 
  projectId?: number; 
  locationId?: number; 
  materialId?: number;
  refType?: string;
}, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['stock-ledger', params],
    queryFn: () => inventoryApi.getStockLedger(params),
    enabled: options?.enabled ?? true,
  });
}
