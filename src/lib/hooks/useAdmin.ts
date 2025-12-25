import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/lib/api/userApi";
import { toast } from "sonner";
import type { User, BackendRole, AuditLog } from "@/types";

/* ================= USERS ================= */

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await userApi.getAll();
      return Array.isArray(response) ? response : [];
    },
  });
}

export function useUser(id: string | number) {
  return useQuery<User | null>({
    queryKey: ['admin-users', id],
    queryFn: async () => {
      const response = await userApi.getById(id);
      return response || null;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      roleId: number;
    }) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create user');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string | number; 
      data: { name?: string; phone?: string; isActive?: boolean; roleId?: number } 
    }) => userApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update user');
    },
  });
}

/* ================= ROLES ================= */

export function useRoles() {
  return useQuery<BackendRole[]>({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const response = await userApi.getRoles();
      return Array.isArray(response) ? response : [];
    },
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { name: string }) => userApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Role created successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create role');
    },
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
      userApi.assignPermissions(roleId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      toast.success('Permissions assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to assign permissions');
    },
  });
}

/* ================= AUDIT LOGS ================= */

export function useAuditLogs() {
  return useQuery<AuditLog[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: async () => {
      const response = await userApi.getAuditLogs();
      return Array.isArray(response) ? response : [];
    },
  });
}
