import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client"; // adjust path if needed

const API_BASE = "/contracts";

// =============== CONTRACTORS =====================
export const useContractors = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["contractors", params],
    queryFn: async () => {
      const queryString = params
        ? "?" + new URLSearchParams(params as any).toString()
        : "";
      const res = await apiClient.request(
        `${API_BASE}/contractors${queryString}`,
        { method: "GET" }
      );
      return res.data;
    },
  });
};

export const useContractor = (id?: string) => {
  return useQuery({
    queryKey: ["contractor", id],
    queryFn: async () => {
      const res = await apiClient.request(`${API_BASE}/contractors/${id}`, {
        method: "GET",
      });
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateContractor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.request(`${API_BASE}/contractors`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors"] }),
  });
};

export const useUpdateContractor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await apiClient.request(`${API_BASE}/contractors/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractors"] });
      qc.invalidateQueries({ queryKey: ["contractor"] });
    },
  });
};

export const useDeleteContractor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.request(`${API_BASE}/contractors/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contractors"] }),
  });
};

// =============== LABOUR RATES =====================
export const useLabourRates = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["labourRates", params],
    queryFn: async () => {
      const queryString = params
        ? "?" + new URLSearchParams(params as any).toString()
        : "";
      const res = await apiClient.request(
        `${API_BASE}/labour-rates${queryString}`,
        { method: "GET" }
      );
      return res.data.data;
    },
  });
};

export const useLabourRate = (id?: string) => {
  return useQuery({
    queryKey: ["labourRate", id],
    queryFn: async () => {
      const res = await apiClient.request(`${API_BASE}/labour-rates/${id}`, {
        method: "GET",
      });
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateLabourRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.request(`${API_BASE}/labour-rates`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labourRates"] }),
  });
};

export const useUpdateLabourRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await apiClient.request(`${API_BASE}/labour-rates/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["labourRates"] });
      qc.invalidateQueries({ queryKey: ["labourRate"] });
    },
  });
};

export const useDeleteLabourRate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.request(`${API_BASE}/labour-rates/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labourRates"] }),
  });
};

// =============== WORK ORDERS =====================
// export const useWorkOrders = (params?: Record<string, any>) => {
//   return useQuery({
//     queryKey: ['workOrders', params ?? {}],
//     queryFn: async () => {
//       const queryString =
//         params && Object.keys(params).length
//           ? '?' + new URLSearchParams(params as any).toString()
//           : '';
//       const res = await apiClient.request(`/contracts/work-orders${queryString}`, {
//         method: 'GET',
//       });

//       // ✅ Ensure we always return an array (never undefined)
//       if (!res?.data) return [];
//       if (Array.isArray(res.data)) return res.data;
//       if (res.data?.data) return res.data.data;
//       return [];
//     },
//   });
// };
export const useWorkOrders = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["workOrders", params],
    queryFn: async () => {
      const queryString = params
        ? "?" + new URLSearchParams(params as any).toString()
        : "";
      const res = await apiClient.request(
        `/contracts/work-orders${queryString}`,
        {
          method: "GET",
        }
      );

      // return only the array part
      console.log(res)
      return res.data || [];
    },
  });
};

export const useWorkOrderItems = (workOrderId?: string) => {
  return useQuery({
    queryKey: ['workOrderItems', workOrderId],
    queryFn: async () => {
      if (!workOrderId) return [];
      const res = await apiClient.request(`/contracts/work-orders/${workOrderId}/items`, {
        method: 'GET',
      });
      return res.data || [];
    },
    enabled: !!workOrderId,
  });
};

export const useWorkOrder = (id?: string) => {
  return useQuery({
    queryKey: ["workOrder", id],
    queryFn: async () => {
      const res = await apiClient.request(`${API_BASE}/work-orders/${id}`, {
        method: "GET",
      });
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useCreateWorkOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.request(`${API_BASE}/work-orders`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workOrders"] }),
  });
};

export const useUpdateWorkOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await apiClient.request(`${API_BASE}/work-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workOrders"] });
      qc.invalidateQueries({ queryKey: ["workOrder"] });
    },
  });
};

export const useApproveWorkOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.request(
        `${API_BASE}/work-orders/${id}/approve`,
        { method: "POST" }
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workOrders"] }),
  });
};

// =============== RA BILLS =====================
export const useRABills = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ["raBills", params ?? {}],
    queryFn: async () => {
      const queryString =
        params && Object.keys(params).length
          ? "?" + new URLSearchParams(params as any).toString()
          : "";

      const res = await apiClient.request(
        `${API_BASE}/ra-bills${queryString}`,
        {
          method: "GET",
        }
      );

      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.data)) return res.data.data;
      return [];
    },
  });
};

export const useRABill = (id?: string) => {
  return useQuery({
    queryKey: ["raBill", id],
    queryFn: async () => {
      const res = await apiClient.request(`${API_BASE}/ra-bills/${id}`, {
        method: "GET",
      });
      // ✅ Handle consistent return
      return res.data?.data ?? res.data ?? null;
    },
    enabled: !!id, // only fetch when id exists
  });
};

export const useCreateRABill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.request(`${API_BASE}/ra-bills`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raBills"] });
    },
  });
};

export const useUpdateRABill = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await apiClient.request(`${API_BASE}/ra-bills/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raBills"] });
      queryClient.invalidateQueries({ queryKey: ["raBill"] });
    },
  });
};

export const useApproveRABill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.request(
        `${API_BASE}/ra-bills/${id}/approve`,
        { method: "POST" }
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["raBills"] }),
  });
};
