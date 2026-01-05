// src/lib/api/index.ts
// Centralized API exports for the Construction ERP

export { apiClient, setClientToken } from './client';
export { authApi } from './authApi';
export { userApi } from './userApi';
export { auditApi } from './auditApi';
export { profileApi } from './profileApi';
export { dashboardApi } from './dashboardApi';
export { workflowApi } from './workflowApi';
export { accountsApi } from './accountsApi';
export { estimatesApi, bbsApi, budgetApi, drawingsApi, complianceApi } from './engineeringApi';
export { contractorsApi, labourRatesApi, workOrdersApi, raBillsApi } from './contractsApi';
export { siteApi } from './siteApi';
export { inventoryApi } from './inventoryApi';
export { qaqcApi } from './qaqcApi';
export { partnersApi } from './partnersApi';
export { materialMasterApi, mrFromBOQApi } from './materialMasterApi';
export { supplierApi } from './supplierApi';

export { 
  mrApi, 
  rfqApi,
  quotationApi, 
  comparativeStatementApi, 
  poApi, 
  purchaseBillApi, 
  materialRateApi,
  purchaseDashboardApi 
} from './purchaseApi';
export { projectsApi, materialsApi, companiesApi, suppliersApi, uomsApi, departmentsApi, costCentersApi, taxesApi } from './mastersApi';
