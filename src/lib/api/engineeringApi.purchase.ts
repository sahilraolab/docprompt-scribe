import { apiClient } from './client';

/**
 * ⚠️ Purchase-specific Engineering APIs
 * Do NOT reuse generic engineering hooks
 */

export const purchaseEngineeringApi = {
  /** Approved budgets for a project */
  getApprovedBudgetsByProject: (projectId: number) =>
    apiClient.request(
      `/engineering/budget?projectId=${projectId}&status=APPROVED`
    ),

  /** Final estimates for a project */
  getFinalEstimatesByProject: (projectId: number) =>
    apiClient.request(
      `/engineering/estimate?projectId=${projectId}&status=FINAL`
    ),
};
