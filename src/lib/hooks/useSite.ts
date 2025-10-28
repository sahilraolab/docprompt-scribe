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
      toast.error(error?.response?.data?.message || "Failed to create item");
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
      toast.success("Item updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update item");
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
      toast.error(error?.response?.data?.message || "Failed to delete item");
    },
  });
}

// -------- STOCK --------
export function useStock() {
  return useQuery({
    queryKey: ["stock"],
    queryFn: siteApi.getAllStock,
  });
}

export function useStockById(id: string) {
  return useQuery({
    queryKey: ["stock", id],
    queryFn: () => siteApi.getStockById(id),
    enabled: !!id,
  });
}
