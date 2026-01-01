import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteApi } from "@/lib/api/siteApi";
import { toast } from "sonner";

// -------- ITEMS --------
export function useItems() {
  return useQuery({
    queryKey: ["items"],
    queryFn: siteApi.getAllItems,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => siteApi.getItemById(id),
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create item");
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      siteApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["item"] });
      toast.success("Item updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update item");
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Item deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete item");
    },
  });
}

// -------- STOCK --------
export function useStock(params?: { projectId?: string; location?: string }) {
  return useQuery({
    queryKey: ["stock", params],
    queryFn: () => siteApi.getAllStock(params),
  });
}

export function useStockById(id: string) {
  return useQuery({
    queryKey: ["stock", id],
    queryFn: () => siteApi.getStockById(id),
    enabled: !!id,
  });
}

export function useStockByProject(projectId: string) {
  return useQuery({
    queryKey: ["stock", "project", projectId],
    queryFn: () => siteApi.getStockByProject(projectId),
    enabled: !!projectId,
  });
}

export function useStockLedger(params?: { itemId?: string; projectId?: string; fromDate?: string; toDate?: string }) {
  return useQuery({
    queryKey: ["stock-ledger", params],
    queryFn: () => siteApi.getStockLedger(params),
    enabled: !!params?.itemId || !!params?.projectId,
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Stock adjusted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to adjust stock");
    },
  });
}

// -------- GRN (Goods Receipt Notes) --------
export function useGRNs(params?: { poId?: string; status?: string }) {
  return useQuery({
    queryKey: ["grns", params],
    queryFn: () => siteApi.getAllGRN(params),
  });
}

export function useGRN(id?: string) {
  return useQuery({
    queryKey: ["grn", id],
    queryFn: () => siteApi.getGRNById(id!),
    enabled: !!id,
  });
}

export function useCreateGRN() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.createGRN,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("GRN created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create GRN");
    },
  });
}

export function useUpdateGRN() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      siteApi.updateGRN(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["grn"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("GRN updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update GRN");
    },
  });
}

export function useApproveGRN() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      siteApi.approveGRN(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grns"] });
      queryClient.invalidateQueries({ queryKey: ["grn"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("GRN approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve GRN");
    },
  });
}

// -------- MATERIAL ISSUES --------
export function useIssues(params?: { projectId?: string; status?: string }) {
  return useQuery({
    queryKey: ["issues", params],
    queryFn: () => siteApi.getAllIssues(params),
  });
}

export function useIssue(id?: string) {
  return useQuery({
    queryKey: ["issue", id],
    queryFn: () => siteApi.getIssueById(id!),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Material issue created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create material issue");
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      siteApi.updateIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Material issue updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update material issue");
    },
  });
}

export function useApproveIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      siteApi.approveIssue(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });
      queryClient.invalidateQueries({ queryKey: ["issue"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Issue approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve issue");
    },
  });
}

// -------- STOCK TRANSFERS --------
export function useTransfers(params?: { fromProjectId?: string; toProjectId?: string; status?: string }) {
  return useQuery({
    queryKey: ["transfers", params],
    queryFn: () => siteApi.getAllTransfers(params),
  });
}

export function useTransfer(id?: string) {
  return useQuery({
    queryKey: ["transfer", id],
    queryFn: () => siteApi.getTransferById(id!),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Stock transfer created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create stock transfer");
    },
  });
}

export function useUpdateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      siteApi.updateTransfer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transfer"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Stock transfer updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update stock transfer");
    },
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks?: string }) =>
      siteApi.approveTransfer(id, remarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transfer"] });
      toast.success("Transfer approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve transfer");
    },
  });
}

export function useReceiveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => siteApi.receiveTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["transfer"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Transfer received successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to receive transfer");
    },
  });
}

// -------- QUALITY CONTROL --------
export function useQCs() {
  return useQuery({
    queryKey: ["qcs"],
    queryFn: siteApi.getAllQC,
  });
}

export function useQC(id?: string) {
  return useQuery({
    queryKey: ["qc", id],
    queryFn: () => siteApi.getQCById(id!),
    enabled: !!id,
  });
}

export function useCreateQC() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: siteApi.createQC,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qcs"] });
      toast.success("QC inspection created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create QC inspection");
    },
  });
}

export function useUpdateQC() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      siteApi.updateQC(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qcs"] });
      queryClient.invalidateQueries({ queryKey: ["qc"] });
      toast.success("QC inspection updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update QC inspection");
    },
  });
}
