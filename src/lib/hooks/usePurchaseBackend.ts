import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

/* =====================================================
   SUPPLIER
===================================================== */

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: () => apiClient.request("/masters/suppliers"),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => apiClient.request(`/masters/suppliers/${id}`),
    enabled: !!id,
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.request("/masters/suppliers", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier created successfully");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create supplier"),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.request(`/masters/suppliers/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier updated successfully");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update supplier"),
  });
}

/* =====================================================
   MATERIAL REQUISITION (MR)
===================================================== */

export function useMRs(params?: { projectId?: number }) {
  return useQuery({
    queryKey: ["mrs", params?.projectId],
    queryFn: () => {
      const url = params?.projectId
        ? `/purchase/requisitions?projectId=${params.projectId}`
        : "/purchase/requisitions";
      return apiClient.request(url);
    },
  });
}

export function useMR(id: string) {
  return useQuery({
    queryKey: ["mr", id],
    queryFn: () => apiClient.request(`/purchase/requisitions/${id}`),
    enabled: !!id,
  });
}

export function useCreateMR() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.request("/purchase/requisitions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mrs"] });
      toast.success("Material Requisition created");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create MR"),
  });
}

/* =====================================================
   PURCHASE ORDER (PO)
===================================================== */

export function usePOs(params?: { projectId?: number }) {
  return useQuery({
    queryKey: ["pos", params?.projectId],
    queryFn: () => {
      const url = params?.projectId
        ? `/purchase/po?projectId=${params.projectId}`
        : "/purchase/po";
      return apiClient.request(url);
    },
  });
}

export function usePO(id: string) {
  return useQuery({
    queryKey: ["po", id],
    queryFn: () => apiClient.request(`/purchase/po/${id}`),
    enabled: !!id,
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.request("/purchase/po", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos"] });
      toast.success("Purchase Order created");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create PO"),
  });
}

export function useUpdatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.request(`/purchase/po/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos"] });
      toast.success("Purchase Order updated");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update PO"),
  });
}

export function useApprovePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiClient.request(`/purchase/po/${id}/approve`, { method: "PUT" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos"] });
      toast.success("Purchase Order approved");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to approve PO"),
  });
}

export function useRejectPO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      apiClient.request(`/purchase/po/${id}/reject`, { method: "PUT" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos"] });
      toast.success("Purchase Order rejected");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to reject PO"),
  });
}

/* =====================================================
   QUOTATION
===================================================== */

export function useQuotations(params?: { rfqId?: number }) {
  return useQuery({
    queryKey: ["quotations", params?.rfqId],
    queryFn: () => {
      const url = params?.rfqId
        ? `/purchase/quotations?rfqId=${params.rfqId}`
        : "/purchase/quotations";
      return apiClient.request(url);
    },
  });
}

export function useQuotation(id: string) {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: () => apiClient.request(`/purchase/quotations/${id}`),
    enabled: !!id,
  });
}

export function useQuotationsByMR(mrId: string) {
  return useQuery({
    queryKey: ["quotations-by-mr", mrId],
    queryFn: () => apiClient.request(`/purchase/quotations?mrId=${mrId}`),
    enabled: !!mrId,
  });
}

export function useApproveQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) =>
      apiClient.request(`/purchase/quotations/${id}/approve`, {
        method: "PUT",
        body: JSON.stringify(data || {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation approved");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to approve quotation"),
  });
}

export function useRejectQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) =>
      apiClient.request(`/purchase/quotations/${id}/reject`, {
        method: "PUT",
        body: JSON.stringify(data || {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation rejected");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to reject quotation"),
  });
}

/* =====================================================
   PURCHASE BILL
===================================================== */

export function usePurchaseBills(params?: { projectId?: number }) {
  return useQuery({
    queryKey: ["purchaseBills", params?.projectId],
    queryFn: () => {
      const url = params?.projectId
        ? `/purchase/bills?projectId=${params.projectId}`
        : "/purchase/bills";
      return apiClient.request(url);
    },
  });
}

export function usePurchaseBill(id: string) {
  return useQuery({
    queryKey: ["purchaseBill", id],
    queryFn: () => apiClient.request(`/purchase/bills/${id}`),
    enabled: !!id,
  });
}

export function useCreatePurchaseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.request("/purchase/bills", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchaseBills"] });
      toast.success("Purchase bill created");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create bill"),
  });
}

export function useUpdatePurchaseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.request(`/purchase/bills/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchaseBills"] });
      toast.success("Purchase bill updated");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update bill"),
  });
}

export function usePostPurchaseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.request(`/purchase/bills/${id}/post`, { method: "PUT" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchaseBills"] });
      toast.success("Bill posted to accounts");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to post bill"),
  });
}

/* =====================================================
   MATERIAL RATES
===================================================== */

export function useMaterialRates() {
  return useQuery({
    queryKey: ["materialRates"],
    queryFn: () => apiClient.request("/purchase/rates"),
  });
}

export function useMaterialRate(id: string) {
  return useQuery({
    queryKey: ["materialRate", id],
    queryFn: () => apiClient.request(`/purchase/rates/${id}`),
    enabled: !!id,
  });
}

export function useCreateMaterialRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.request("/purchase/rates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materialRates"] });
      toast.success("Material rate created");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create rate"),
  });
}

export function useUpdateMaterialRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.request(`/purchase/rates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["materialRates"] });
      toast.success("Material rate updated");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update rate"),
  });
}

/* =====================================================
   COMPARATIVE STATEMENT
===================================================== */

export function useComparativeStatements() {
  return useQuery({
    queryKey: ["comparativeStatements"],
    queryFn: () => apiClient.request("/purchase/comparative-statements"),
  });
}

export function useComparativeStatement(id: string) {
  return useQuery({
    queryKey: ["comparativeStatement", id],
    queryFn: () => apiClient.request(`/purchase/comparative-statements/${id}`),
    enabled: !!id,
  });
}

export function useCreateComparativeStatement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      apiClient.request("/purchase/comparative-statements", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comparativeStatements"] });
      toast.success("Comparative statement created");
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create statement"),
  });
}
