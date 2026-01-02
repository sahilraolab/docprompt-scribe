import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  requisitionApi,
  rfqApi,
  quotationApi,
  poApi,
  purchaseBillApi,
} from '@/lib/api/purchaseApi';
import { toast } from 'sonner';

/* =====================================================
   REQUISITION
===================================================== */

export function useRequisitions(params?: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['requisitions', params],
    queryFn: () => requisitionApi.list(params),
    enabled: options?.enabled ?? true,
  });
}

export function useRequisition(id?: number) {
  return useQuery({
    queryKey: ['requisition', id],
    queryFn: () => requisitionApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateRequisition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requisitionApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requisitions'] });
      toast.success('Requisition created');
    },
  });
}

export function useSubmitRequisition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requisitionApi.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requisitions'] });
      toast.success('Requisition submitted');
    },
  });
}

/* =====================================================
   RFQ
===================================================== */

export function useRFQs(params?: any) {
  return useQuery({
    queryKey: ['rfqs', params],
    queryFn: () => rfqApi.list(params),
  });
}

export function useCreateRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rfqApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ created');
    },
  });
}

/* =====================================================
   QUOTATION
===================================================== */

export function useQuotations(params?: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['quotations', params],
    queryFn: () => quotationApi.list(params),
    enabled: options?.enabled ?? true,
  });
}

export function useQuotation(id?: number) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => quotationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation submitted');
    },
  });
}

export function useApproveQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation approved');
    },
  });
}

/* =====================================================
   PURCHASE ORDER
===================================================== */

export function usePOs(params?: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['pos', params],
    queryFn: () => poApi.list(params),
    enabled: options?.enabled ?? true,
  });
}

export function usePO(id?: number) {
  return useQuery({
    queryKey: ['po', id],
    queryFn: () => poApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: poApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pos'] });
      toast.success('PO created & sent for approval');
    },
  });
}

/* =====================================================
   PURCHASE BILL
===================================================== */

export function usePurchaseBills(params?: any, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['purchaseBills', params],
    queryFn: () => purchaseBillApi.list(params),
    enabled: options?.enabled ?? true,
  });
}

export function usePurchaseBill(id?: number) {
  return useQuery({
    queryKey: ['purchaseBill', id],
    queryFn: () => purchaseBillApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePurchaseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseBillApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchaseBills'] });
      toast.success('Purchase bill created');
    },
  });
}

export function usePostPurchaseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseBillApi.postToAccounts,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['purchaseBills'] });
      toast.success('Bill posted to accounts');
    },
  });
}
