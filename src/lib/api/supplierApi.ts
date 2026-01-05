// src/lib/api/supplierApi.ts
import { apiClient } from './client';

/* =====================================================
   SUPPLIER APIs (RAW FUNCTIONS FOR REACT QUERY)
===================================================== */

/**
 * Get OPEN RFQs assigned to logged-in supplier
 */
export const getSupplierRFQs = async () => {
  return apiClient.request('/supplier/rfqs', {
    method: 'GET',
  });
};

/**
 * Submit quotation for an RFQ
 * 🔒 Backend derives project/budget/estimate
 */
export const submitSupplierQuotation = async (data: {
  rfqId: number;
  validTill?: string;
  items: {
    materialId: number;
    qty: number;
    rate: number;
    taxPercent: number;
  }[];
}) => {
  return apiClient.request('/supplier/quotations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * List quotations submitted by supplier
 */
export const getSupplierQuotations = async () => {
  return apiClient.request('/supplier/quotations', {
    method: 'GET',
  });
};

export const supplierApi = {
  getSupplierRFQs,
  submitSupplierQuotation,
  getSupplierQuotations,
};
