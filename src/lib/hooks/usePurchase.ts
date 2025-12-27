import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  supplierApi, 
  mrApi, 
  poApi, 
  quotationApi, 
  materialRateApi, 
  purchaseBillApi, 
  comparativeStatementApi,
  rfqApi 
} from '@/lib/api/purchaseApi';

// ============= SUPPLIERS =============
export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const result = await supplierApi.getAll() as any;
      return result.data || result;
    },
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      const result = await supplierApi.getById(id) as any;
      return result.data || result;
    },
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => supplierApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create supplier');
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => supplierApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', variables.id] });
      toast.success('Supplier updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update supplier');
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supplierApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete supplier');
    },
  });
}

// ============= MATERIAL REQUISITIONS =============
export function useMRs(projectId?: string) {
  return useQuery({
    queryKey: ['mrs', projectId].filter(Boolean),
    queryFn: async () => {
      const result = await mrApi.getAll(projectId ? { projectId } : undefined) as any;
      return result.data || result;
    },
  });
}

export function useMR(id: string) {
  return useQuery({
    queryKey: ['mr', id],
    queryFn: async () => {
      const result = await mrApi.getById(id) as any;
      return result.data || result;
    },
    enabled: !!id,
  });
}

export function useCreateMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => mrApi.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: any }) => mrApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      queryClient.invalidateQueries({ queryKey: ['mr', variables.id] });
      toast.success('Material Requisition updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update MR');
    },
  });
}

export function useSubmitMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mrApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit MR');
    },
  });
}

export function useDeleteMR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mrApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mrs'] });
      toast.success('Material Requisition deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete MR');
    },
  });
}

// ============= RFQ =============
export function useRFQs(requisitionId?: string) {
  return useQuery({
    queryKey: ['rfqs', requisitionId].filter(Boolean),
    queryFn: async () => {
      const result = await rfqApi.getAll(requisitionId ? { requisitionId } : undefined) as any;
      return result.data || result;
    },
  });
}

export function useCreateRFQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => rfqApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create RFQ');
    },
  });
}

// ============= QUOTATIONS =============
export function useQuotations(rfqId?: string) {
  return useQuery({
    queryKey: ['quotations', rfqId].filter(Boolean),
    queryFn: async () => {
      const result = await quotationApi.getAll(rfqId ? { rfqId } : undefined) as any;
      return result.data || result;
    },
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: async () => {
      const result = await quotationApi.getById(id) as any;
      return result.data || result;
    },
    enabled: !!id,
  });
}

export function useQuotationsByMR(mrId: string) {
  return useQuery({
    queryKey: ['quotations', 'mr', mrId],
    queryFn: async () => {
      const result = await quotationApi.getAll({ rfqId: mrId }) as any;
      return result.data || result;
    },
    enabled: !!mrId,
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => quotationApi.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: any }) => quotationApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.id] });
      toast.success('Quotation updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update quotation');
    },
  });
}

export function useApproveQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => quotationApi.approve(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve quotation');
    },
  });
}

export function useRejectQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => quotationApi.reject(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject quotation');
    },
  });
}

// ============= COMPARATIVE STATEMENTS =============
export function useComparativeStatements() {
  return useQuery({
    queryKey: ['comparative-statements'],
    queryFn: async () => {
      const result = await comparativeStatementApi.getAll() as any;
      return result.data || result;
    },
  });
}

export function useComparativeStatement(id: string) {
  return useQuery({
    queryKey: ['comparative-statement', id],
    queryFn: async () => {
      const result = await comparativeStatementApi.getById(id) as any;
      return result.data || result;
    },
    enabled: !!id,
  });
}

export function useCreateComparativeStatement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => comparativeStatementApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparative-statements'] });
      toast.success('Comparative statement created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create comparative statement');
    },
  });
}

export function useSelectSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, supplierId, quotationId, remarks }: { id: string; supplierId: string; quotationId: string; remarks?: string }) => 
      comparativeStatementApi.selectSupplier(id, supplierId, quotationId, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparative-statements'] });
      toast.success('Supplier selected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to select supplier');
    },
  });
}

// ============= PURCHASE ORDERS =============
export function usePOs(projectId?: string) {
  return useQuery({
    queryKey: ['pos', projectId].filter(Boolean),
    queryFn: async () => {
      const result = await poApi.getAll(projectId ? { projectId } : undefined) as any;
      return result.data || result;
    },
  });
}

export function usePO(id: string) {
  return useQuery({
    queryKey: ['po', id],
    queryFn: async () => {
      const result = await poApi.getById(id) as any;
      return result.data || result;
    },
    enabled: !!id,
  });
}

export function useCreatePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => poApi.create(data),
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
    mutationFn: ({ id, data }: { id: string; data: any }) => poApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      queryClient.invalidateQueries({ queryKey: ['po', variables.id] });
      toast.success('Purchase Order updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update PO');
    },
  });
}

export function useSubmitPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => poApi.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit PO');
    },
  });
}

export function useApprovePO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => poApi.approve(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve PO');
    },
  });
}

export function useCancelPO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) => poApi.cancel(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos'] });
      toast.success('Purchase Order cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel PO');
    },
  });
}

// ============= PURCHASE BILLS =============
export function usePurchaseBills(poId?: string) {
  return useQuery({
    queryKey: ['purchase-bills', poId].filter(Boolean),
    queryFn: async () => {
      const result = await purchaseBillApi.getAll(poId ? { poId } : undefined) as any;
      return result.data || result;
    },
  });
}

export function usePurchaseBill(id: string) {
  return useQuery({
    queryKey: ['purchase-bill', id],
    queryFn: async () => {
      const result = await purchaseBillApi.getById(id) as any;
      return result.data || result;
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => purchaseBillApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      toast.success('Purchase bill created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create purchase bill');
    },
  });
}

export function useUpdatePurchaseBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => purchaseBillApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-bill', variables.id] });
      toast.success('Purchase bill updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update purchase bill');
    },
  });
}

export function usePostPurchaseBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseBillApi.post(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-bills'] });
      toast.success('Purchase bill posted to accounts');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post purchase bill');
    },
  });
}

// ============= MATERIAL RATES =============
export function useMaterialRates() {
  return useQuery({
    queryKey: ['materialRates'],
    queryFn: async () => {
      const result = await materialRateApi.getAll() as any;
      return result.data || result;
    },
  });
}

export function useMaterialRate(id: string) {
  return useQuery({
    queryKey: ['materialRate', id],
    queryFn: async () => {
      const result = await materialRateApi.getById(id) as any;
      return result.data || result;
    },
    enabled: !!id,
  });
}

export function useCreateMaterialRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => materialRateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materialRates'] });
      toast.success('Material rate created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create material rate');
    },
  });
}

export function useUpdateMaterialRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => materialRateApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['materialRates'] });
      queryClient.invalidateQueries({ queryKey: ['materialRate', variables.id] });
      toast.success('Material rate updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update material rate');
    },
  });
}
