import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/userApi";
import { toast } from "sonner";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await userApi.getAll();
      return response.data;
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await userApi.getById(id);
      return response.data;
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
      return response.data;
    },

    // ✅ Use variables.id safely here
    onSuccess: (response, variables) => {
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      }
      queryClient.invalidateQueries({ queryKey: ["users"] });

      toast.success(response?.message || "User updated successfully");
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
