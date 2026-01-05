import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getSupplierRFQs,
  submitSupplierQuotation,
} from "@/lib/api/supplierApi";

/* ============================
   SUPPLIER RFQs
============================ */

export const useSupplierRFQs = () =>
  useQuery({
    queryKey: ["supplier-rfqs"],
    queryFn: getSupplierRFQs,
  });

/* ============================
   SUBMIT QUOTATION
============================ */

export const useSubmitSupplierQuotation = () =>
  useMutation({
    mutationFn: submitSupplierQuotation,
  });
