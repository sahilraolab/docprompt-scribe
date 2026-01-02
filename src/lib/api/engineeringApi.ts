import { apiClient } from "./client";

/* =====================================================
   BUDGET API
===================================================== */

export const budgetApi = {
  getByProject: (projectId: number) =>
    apiClient.request(`/engineering/budget/${projectId}`),

  create: (data: {
    projectId: number;
    totalBudget: number;
  }) =>
    apiClient.request("/engineering/budget", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: number) =>
    apiClient.request(`/engineering/budget/${id}/approve`, {
      method: "PUT",
    }),
};

/* =====================================================
   ESTIMATE API
===================================================== */

export const estimatesApi = {
  getByProject: (projectId: number) =>
    apiClient.request(
      `/engineering/estimate?projectId=${projectId}`
    ),

  create: (data: {
    projectId: number;
    name: string;
    baseAmount: number;
  }) =>
    apiClient.request("/engineering/estimate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  addVersion: (data: {
    estimateId: number;
    amount: number;
  }) =>
    apiClient.request("/engineering/estimate/version", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: number) =>
    apiClient.request(
      `/engineering/estimate/${id}/approve`,
      { method: "PUT" }
    ),
};

/* =====================================================
   BBS (BOQ) API
===================================================== */

export const bbsApi = {
  getByProject: (projectId: number) =>
    apiClient.request(
      `/engineering/bbs?projectId=${projectId}`
    ),

  create: (data: {
    projectId: number;
    estimateId: number;
    description?: string;
    quantity: number;
    uomId: number;
    rate: number;
  }) =>
    apiClient.request("/engineering/bbs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: number) =>
    apiClient.request(`/engineering/bbs/${id}/approve`, {
      method: "PUT",
    }),
};

/* =====================================================
   DRAWINGS API
===================================================== */

export const drawingsApi = {
  /** Project-wise drawings */
  getByProject: (projectId: number) =>
    apiClient.request(
      `/engineering/drawings?projectId=${projectId}`
    ),

  /** Single drawing (edit / revise screen) */
  getById: (id: number) =>
    apiClient.request(`/engineering/drawings/${id}`),

  create: (data: {
    projectId: number;
    title: string;
    discipline?: string;
  }) =>
    apiClient.request("/engineering/drawings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  revise: (data: {
    drawingId: number;
    changeNote: string;
  }) =>
    apiClient.request("/engineering/drawings/revision", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  approve: (id: number) =>
    apiClient.request(
      `/engineering/drawings/${id}/approve`,
      { method: "PUT" }
    ),
};

/* =====================================================
   COMPLIANCE API ✅ COMPLETE
===================================================== */

export const complianceApi = {
  /** Project-wise compliances */
  getByProject: (projectId: number) =>
    apiClient.request(
      `/engineering/compliance?projectId=${projectId}`
    ),

  /** Single compliance (edit screen) */
  getById: (id: number) =>
    apiClient.request(`/engineering/compliance/${id}`),

  create: (data: {
    projectId: number;
    type: string;
    documentRef?: string | null;
    validTill?: string | null;
    blocking?: boolean;
  }) =>
    apiClient.request("/engineering/compliance", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: {
    type: string;
    documentRef?: string | null;
    validTill?: string | null;
    blocking?: boolean;
  }) =>
    apiClient.request(`/engineering/compliance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  close: (id: number) =>
    apiClient.request(
      `/engineering/compliance/${id}/close`,
      { method: "PUT" }
    ),
};
