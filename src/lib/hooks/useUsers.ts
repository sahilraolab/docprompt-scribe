import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/userApi";
import { toast } from "sonner";
import type { User } from "@/types";

// Helper to normalize user data from backend
const normalizeUser = (userData: any): User => ({
  ...userData,
  id: userData.id || userData._id,
  _id: userData._id || userData.id,
});

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await userApi.getAll();
      // Handle both { data: [...] } and direct array formats
      const users = response?.data || response || [];
      return Array.isArray(users) ? users.map(normalizeUser) : [];
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await userApi.getById(id);
      // Handle both { data: {...} } and direct object formats
      const userData = response?.data || response;
      return userData ? normalizeUser(userData) : null;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await userApi.update(id, data);
      // Handle both { data: {...} } and direct object response
      return response?.data || response;
    },

    onSuccess: (response, variables) => {
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },

    onError: (error: any) => {
      console.error("Update error:", error);
      toast.error(error?.message || "Failed to update user");
    },
  });
}


export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}
