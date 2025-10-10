import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mrsApi, quotationsApi, csApi, posApi, purchaseBillsApi, itemsApi } from '@/lib/api/purchaseApiBackend';
import { toast } from 'sonner';

// Material Requisitions hooks
export function useMRs() {
  return useQuery({
    queryKey: ['mrs'],
    queryFn: mrsApi.getAll,
  });
}

export function useMR(id: string) {
  return useQuery({
    queryKey: ['mrs', id],
    queryFn: () => mrsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mrsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create MR');
    },
  });
}

export function useUpdateMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => mrsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update MR');
    },
  });
}

export function useDeleteMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mrsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete MR');
    },
  });
}

export function useSubmitMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mrsApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit MR');
    },
  });
}

export function useApproveMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => mrsApi.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve MR');
    },
  });
}

export function useRejectMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => mrsApi.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject MR');
    },
  });
}

// Quotations hooks
export function useQuotations() {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: quotationsApi.getAll,
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ['quotations', id],
    queryFn: () => quotationsApi.getById(id),
    enabled: !!id,
  });
}

export function useQuotationsByMR(mrId: string) {
  return useQuery({
    queryKey: ['quotations', 'mr', mrId],
    queryFn: () => quotationsApi.getByMR(mrId),
    enabled: !!mrId,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create quotation');
    },
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => quotationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quotation');
    },
  });
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quotationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete quotation');
    },
  });
}

// Comparative Statements hooks
export function useComparativeStatements() {
  return useQuery({
    queryKey: ['comparative-statements'],
    queryFn: csApi.getAll,
  });
}

export function useComparativeStatement(id: string) {
  return useQuery({
    queryKey: ['comparative-statements', id],
    queryFn: () => csApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateComparativeStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: csApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparative-statements'] });
      toast.success('Comparative Statement created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create comparative statement');
    },
  });
}

export function useUpdateComparativeStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => csApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparative-statements'] });
      toast.success('Comparative Statement updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update comparative statement');
    },
  });
}

export function useDeleteComparativeStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: csApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparative-statements'] });
      toast.success('Comparative Statement deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete comparative statement');
    },
  });
}

export function useSelectSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, supplierId }: { id: string; supplierId: string }) => 
      csApi.selectSupplier(id, supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparative-statements'] });
      toast.success('Supplier selected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to select supplier');
    },
  });
}

// Purchase Orders hooks
export function usePOs() {
  return useQuery({
    queryKey: ['pos'],
    queryFn: posApi.getAll,
  });
}

export function usePO(id: string) {
  return useQuery({
    queryKey: ['pos', id],
    queryFn: () => posApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: posApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create PO');
    },
  });
}

export function useUpdatePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => posApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update PO');
    },
  });
}

export function useDeletePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: posApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete PO');
    },
  });
}

export function useSubmitPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: posApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order submitted for approval');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit PO');
    },
  });
}

export function useApprovePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => posApi.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve PO');
    },
  });
}

export function useRejectPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => posApi.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject PO');
    },
  });
}

// Purchase Bills hooks
export function usePurchaseBills() {
  return useQuery({
    queryKey: ['purchase-bills'],
    queryFn: purchaseBillsApi.getAll,
  });
}

export function usePurchaseBill(id: string) {
  return useQuery({
    queryKey: ['purchase-bills', id],
    queryFn: () => purchaseBillsApi.getById(id),
    enabled: !!id,
  });
}

export function usePurchaseBillsByPO(poId: string) {
  return useQuery({
    queryKey: ['purchase-bills', 'po', poId],
    queryFn: () => purchaseBillsApi.getByPO(poId),
    enabled: !!poId,
  });
}

export function useCreatePurchaseBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseBillsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      toast.success('Purchase Bill created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create purchase bill');
    },
  });
}

export function useUpdatePurchaseBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => purchaseBillsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      toast.success('Purchase Bill updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update purchase bill');
    },
  });
}

export function useDeletePurchaseBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: purchaseBillsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      toast.success('Purchase Bill deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete purchase bill');
    },
  });
}

// Items hooks
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: itemsApi.getAll,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => itemsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create item');
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => itemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Item deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });
}
