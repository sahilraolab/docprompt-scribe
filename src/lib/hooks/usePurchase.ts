import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  requisitionApi,
  rfqApi,
  quotationApi,
  poApi,
  purchaseBillApi,
} from "@/lib/api/purchaseApi";
import { toast } from "sonner";

/* =====================================================
   REQUISITION
===================================================== */

export function useRequisitions(
  params?: { projectId?: number },
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? Boolean(params?.projectId);

  return useQuery({
    queryKey: ["requisitions", params?.projectId],
    queryFn: () => requisitionApi.list(params),
    enabled,
  });
}

export function useRequisition(id?: number) {
  return useQuery({
    queryKey: ["requisition", id],
    queryFn: () => requisitionApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateRequisition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requisitionApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requisitions"] });
      toast.success("Requisition created");
    },
  });
}

export function useSubmitRequisition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: requisitionApi.submit,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["requisitions"] });
      toast.success("Requisition submitted");
    },
  });
}

/* =====================================================
   RFQ
===================================================== */

export function useRFQs(
  params?: { requisitionId?: number },
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? Boolean(params?.requisitionId);

  return useQuery({
    queryKey: ["rfqs", params?.requisitionId],
    queryFn: () => rfqApi.list(params),
    enabled,
  });
}

export function useCreateRFQ() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rfqApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rfqs"] });
      toast.success("RFQ created");
    },
  });
}

export function useCloseRFQ() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rfqApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rfqs'] });
      toast.success('RFQ closed successfully');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to close RFQ');
    },
  });
}


/* =====================================================
   QUOTATION
===================================================== */

export function useQuotations(
  params?: { rfqId?: number },
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? Boolean(params?.rfqId);

  return useQuery({
    queryKey: ["quotations", params?.rfqId],
    queryFn: () => quotationApi.list(params),
    enabled,
  });
}

export function useQuotation(id?: number) {
  return useQuery({
    queryKey: ["quotation", id],
    queryFn: () => quotationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation submitted");
    },
  });
}

export function useApproveQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quotationApi.approve,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation approved");
    },
  });
}

/* =====================================================
   PURCHASE ORDER
===================================================== */

export function usePOs(
  params?: { projectId?: number },
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? Boolean(params?.projectId);

  return useQuery({
    queryKey: ["pos", params?.projectId],
    queryFn: () => poApi.list(params),
    enabled,
  });
}

export function usePO(id?: number) {
  return useQuery({
    queryKey: ["po", id],
    queryFn: () => poApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePO() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: poApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos"] });
      toast.success("PO created & sent for approval");
    },
  });
}

/* =====================================================
   PURCHASE BILL
===================================================== */

export function usePurchaseBills(
  params?: { projectId?: number },
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? Boolean(params?.projectId);

  return useQuery({
    queryKey: ["purchaseBills", params?.projectId],
    queryFn: () => purchaseBillApi.list(params),
    enabled,
  });
}

export function usePurchaseBill(id?: number) {
  return useQuery({
    queryKey: ["purchaseBill", id],
    queryFn: () => purchaseBillApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePurchaseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseBillApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchaseBills"] });
      toast.success("Purchase bill created");
    },
  });
}

export function usePostPurchaseBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: purchaseBillApi.postToAccounts,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchaseBills"] });
      toast.success("Bill posted to accounts");
    },
  });
}
