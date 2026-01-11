import { apiClient } from "./client";

/* =====================================================
   BUDGET API - 1:1 Backend Alignment
===================================================== */

export const budgetApi = {
  /** GET /engineering/budget - List budgets with optional filters */
  list: (params?: { projectId?: number; status?: string }) =>
    apiClient.request(
      `/engineering/budget${params ? `?${new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      ).toString()}` : ''}`
    ),

  /** GET /engineering/budget/:projectId - Get budget by project */
  getByProject: (projectId: number) =>
    apiClient.request(`/engineering/budget/${projectId}`),

  /** POST /engineering/budget - Create budget */
  create: (data: { projectId: number; totalBudget: number }) =>
    apiClient.request("/engineering/budget", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /engineering/budget/:id/approve - Approve budget */
  approve: (id: number) =>
    apiClient.request(`/engineering/budget/${id}/approve`, {
      method: "PUT",
    }),

  /** GET /engineering/budget/template - Export budget template */
  exportTemplate: () =>
    apiClient.request("/engineering/budget/template"),

  /** POST /engineering/budget/import - Import budget from Excel */
  import: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.request("/engineering/budget/import", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });
  },

  /** GET /engineering/budget/export - Export budget data */
  exportData: (projectId?: number) =>
    apiClient.request(
      `/engineering/budget/export${projectId ? `?projectId=${projectId}` : ''}`
    ),
};

/* =====================================================
   ESTIMATE API - 1:1 Backend Alignment
===================================================== */

export const estimatesApi = {
  /** GET /engineering/estimate - List estimates by project */
  list: (projectId: number) =>
    apiClient.request(`/engineering/estimate?projectId=${projectId}`),

  /** POST /engineering/estimate - Create estimate */
  create: (data: { projectId: number; name: string; baseAmount: number }) =>
    apiClient.request("/engineering/estimate", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** POST /engineering/estimate/version - Add new version */
  addVersion: (data: { estimateId: number; amount: number }) =>
    apiClient.request("/engineering/estimate/version", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /engineering/estimate/:id/approve - Approve/finalize estimate */
  approve: (id: number) =>
    apiClient.request(`/engineering/estimate/${id}/approve`, {
      method: "PUT",
    }),

  /** GET /engineering/estimate/template - Export estimate template */
  exportTemplate: () =>
    apiClient.request("/engineering/estimate/template"),

  /** POST /engineering/estimate/import - Import estimates from Excel */
  import: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.request("/engineering/estimate/import", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  /** GET /engineering/estimate/export - Export estimate data */
  exportData: (projectId?: number) =>
    apiClient.request(
      `/engineering/estimate/export${projectId ? `?projectId=${projectId}` : ''}`
    ),
};

/* =====================================================
   BBS (BOQ) API - 1:1 Backend Alignment
===================================================== */

export const bbsApi = {
  /** GET /engineering/bbs - List BBS by project */
  list: (projectId: number) =>
    apiClient.request(`/engineering/bbs?projectId=${projectId}`),

  /** POST /engineering/bbs - Create BBS */
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

  /** PUT /engineering/bbs/:id/approve - Approve BBS */
  approve: (id: number) =>
    apiClient.request(`/engineering/bbs/${id}/approve`, {
      method: "PUT",
    }),

  /** GET /engineering/bbs/template - Export BBS template */
  exportTemplate: () =>
    apiClient.request("/engineering/bbs/template"),

  /** POST /engineering/bbs/import - Import BBS from Excel */
  import: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.request("/engineering/bbs/import", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  /** GET /engineering/bbs/export - Export BBS data */
  exportData: (projectId?: number) =>
    apiClient.request(
      `/engineering/bbs/export${projectId ? `?projectId=${projectId}` : ''}`
    ),
};

/* =====================================================
   DRAWINGS API - 1:1 Backend Alignment
===================================================== */

export const drawingsApi = {
  /** GET /engineering/drawings - List drawings by project */
  list: (projectId: number) =>
    apiClient.request(`/engineering/drawings?projectId=${projectId}`),

  /** POST /engineering/drawings - Create drawing (with optional file) */
  create: (data: {
    projectId: number;
    title: string;
    discipline?: string;
    file?: File;
  }) => {
    if (data.file) {
      const formData = new FormData();
      formData.append("projectId", String(data.projectId));
      formData.append("title", data.title);
      if (data.discipline) formData.append("discipline", data.discipline);
      formData.append("file", data.file);
      return apiClient.request("/engineering/drawings", {
        method: "POST",
        body: formData,
        headers: {},
      });
    }
    return apiClient.request("/engineering/drawings", {
      method: "POST",
      body: JSON.stringify({
        projectId: data.projectId,
        title: data.title,
        discipline: data.discipline,
      }),
    });
  },

  /** POST /engineering/drawings/revision - Add revision to drawing */
  revise: (data: { drawingId: number; changeNote: string }) =>
    apiClient.request("/engineering/drawings/revision", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /engineering/drawings/:id/approve - Approve drawing */
  approve: (id: number) =>
    apiClient.request(`/engineering/drawings/${id}/approve`, {
      method: "PUT",
    }),

  /** PUT /engineering/drawings/revision/:id/approve - Approve drawing revision */
  approveRevision: (id: number) =>
    apiClient.request(`/engineering/drawings/revision/${id}/approve`, {
      method: "PUT",
    }),
};

/* =====================================================
   COMPLIANCE API - 1:1 Backend Alignment
===================================================== */

export const complianceApi = {
  /** GET /engineering/compliance - List compliances by project */
  list: (projectId: number) =>
    apiClient.request(`/engineering/compliance?projectId=${projectId}`),

  /** GET /engineering/compliance/:id - Get compliance by ID */
  getById: (id: number) =>
    apiClient.request(`/engineering/compliance/${id}`),

  /** POST /engineering/compliance - Add compliance (with optional file) */
  create: (data: {
    projectId: number;
    type: string;
    documentRef?: string | null;
    validTill?: string | null;
    blocking?: boolean;
    file?: File;
  }) => {
    if (data.file) {
      const formData = new FormData();
      formData.append("projectId", String(data.projectId));
      formData.append("type", data.type);
      if (data.documentRef) formData.append("documentRef", data.documentRef);
      if (data.validTill) formData.append("validTill", data.validTill);
      if (data.blocking !== undefined) formData.append("blocking", String(data.blocking));
      formData.append("file", data.file);
      return apiClient.request("/engineering/compliance", {
        method: "POST",
        body: formData,
        headers: {},
      });
    }
    return apiClient.request("/engineering/compliance", {
      method: "POST",
      body: JSON.stringify({
        projectId: data.projectId,
        type: data.type,
        documentRef: data.documentRef,
        validTill: data.validTill,
        blocking: data.blocking,
      }),
    });
  },

  /** PUT /engineering/compliance/:id - Update compliance */
  update: (
    id: number,
    data: {
      type: string;
      documentRef?: string | null;
      validTill?: string | null;
      blocking?: boolean;
    }
  ) =>
    apiClient.request(`/engineering/compliance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** PUT /engineering/compliance/:id/close - Close compliance */
  close: (id: number) =>
    apiClient.request(`/engineering/compliance/${id}/close`, {
      method: "PUT",
    }),
};
