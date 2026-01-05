import { useQuery } from '@tanstack/react-query';
import { purchaseEngineeringApi } from '@/lib/api/engineeringApi.purchase.ts';

/**
 * 🔒 STRICT hooks for Purchase module
 * Project-scoped, status-enforced
 */

export function useApprovedBudgetsForPurchase(projectId?: number) {
  return useQuery({
    queryKey: ['purchase', 'budgets', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];
      const res = await purchaseEngineeringApi.getApprovedBudgetsByProject(projectId);
      return Array.isArray(res) ? res : res?.data || [];
    },
  });
}

export function useFinalEstimatesForPurchase(projectId?: number) {
  return useQuery({
    queryKey: ['purchase', 'estimates', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      if (!projectId) return [];
      const res = await purchaseEngineeringApi.getFinalEstimatesByProject(projectId);
      return Array.isArray(res) ? res : res?.data || [];
    },
  });
}
