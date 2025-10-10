import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supplierApi, mrApi, poApi, quotationApi, materialRateApi, purchaseBillApi, comparativeStatementApi } from '@/lib/api/purchaseApi';

// Suppliers
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

// Material Requisitions
export function useMRs() {
  return useQuery({
    queryKey: ['mrs'],
    queryFn: async () => {
      const result = await mrApi.getAll() as any;
      return result.data || result;
    },
  });
}

// Purchase Orders
export function usePOs() {
  return useQuery({
    queryKey: ['pos'],
    queryFn: async () => {
      const result = await poApi.getAll() as any;
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

// Quotations
export function useQuotations() {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: async () => {
      const result = await quotationApi.getAll() as any;
      return result.data || result;
    },
  });
}

// Material Rates
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

// ============= MUTATION HOOKS =============

// Suppliers
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
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      supplierApi.update(id, data),
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

// Material Requisitions
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
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      mrApi.update(id, data),
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

// Purchase Orders
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
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      poApi.update(id, data),
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

// Quotations
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
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      quotationApi.update(id, data),
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

// Material Rates
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
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      materialRateApi.update(id, data),
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

// Purchase Bills
export function usePurchaseBills() {
  return useQuery({
    queryKey: ['purchase-bills'],
    queryFn: async () => {
      const result = await purchaseBillApi.getAll() as any;
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
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      purchaseBillApi.update(id, data),
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

// Comparative Statements
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