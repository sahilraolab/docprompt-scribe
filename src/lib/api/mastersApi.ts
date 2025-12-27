import { apiClient } from './client';
import type {
  Project, Material, Company, Supplier, UOM, Department, CostCenter, Tax,
  ProjectFormData, MaterialFormData, CompanyFormData, SupplierFormData,
  UOMFormData, DepartmentFormData, CostCenterFormData, TaxFormData
} from '@/types/masters';

const BASE = '/masters';

// Companies API
export const companiesApi = {
  getAll: (): Promise<Company[]> => apiClient.request(`${BASE}/companies`),
  getById: (id: number): Promise<Company> => apiClient.request(`${BASE}/companies/${id}`),
  create: (data: CompanyFormData): Promise<Company> => 
    apiClient.request(`${BASE}/companies`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CompanyFormData>): Promise<Company> => 
    apiClient.request(`${BASE}/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/companies/${id}`, { method: 'DELETE' }),
};

// Projects API
export const projectsApi = {
  getAll: (): Promise<Project[]> => apiClient.request(`${BASE}/projects`),
  getById: (id: number): Promise<Project> => apiClient.request(`${BASE}/projects/${id}`),
  create: (data: ProjectFormData): Promise<Project> => 
    apiClient.request(`${BASE}/projects`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<ProjectFormData>): Promise<Project> => 
    apiClient.request(`${BASE}/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/projects/${id}`, { method: 'DELETE' }),
};

// Materials API
export const materialsApi = {
  getAll: (): Promise<Material[]> => apiClient.request(`${BASE}/materials`),
  getById: (id: number): Promise<Material> => apiClient.request(`${BASE}/materials/${id}`),
  create: (data: MaterialFormData): Promise<Material> => 
    apiClient.request(`${BASE}/materials`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<MaterialFormData>): Promise<Material> => 
    apiClient.request(`${BASE}/materials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/materials/${id}`, { method: 'DELETE' }),
};

// Suppliers API
export const suppliersApi = {
  getAll: (): Promise<Supplier[]> => apiClient.request(`${BASE}/suppliers`),
  getById: (id: number): Promise<Supplier> => apiClient.request(`${BASE}/suppliers/${id}`),
  create: (data: SupplierFormData): Promise<Supplier> => 
    apiClient.request(`${BASE}/suppliers`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<SupplierFormData>): Promise<Supplier> => 
    apiClient.request(`${BASE}/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/suppliers/${id}`, { method: 'DELETE' }),
};

// UOMs API
export const uomsApi = {
  getAll: (): Promise<UOM[]> => apiClient.request(`${BASE}/uoms`),
  getById: (id: number): Promise<UOM> => apiClient.request(`${BASE}/uoms/${id}`),
  create: (data: UOMFormData): Promise<UOM> => 
    apiClient.request(`${BASE}/uoms`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<UOMFormData>): Promise<UOM> => 
    apiClient.request(`${BASE}/uoms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/uoms/${id}`, { method: 'DELETE' }),
};

// Departments API
export const departmentsApi = {
  getAll: (): Promise<Department[]> => apiClient.request(`${BASE}/departments`),
  getById: (id: number): Promise<Department> => apiClient.request(`${BASE}/departments/${id}`),
  create: (data: DepartmentFormData): Promise<Department> => 
    apiClient.request(`${BASE}/departments`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<DepartmentFormData>): Promise<Department> => 
    apiClient.request(`${BASE}/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/departments/${id}`, { method: 'DELETE' }),
};

// Cost Centers API
export const costCentersApi = {
  getAll: (): Promise<CostCenter[]> => apiClient.request(`${BASE}/cost-centers`),
  getById: (id: number): Promise<CostCenter> => apiClient.request(`${BASE}/cost-centers/${id}`),
  create: (data: CostCenterFormData): Promise<CostCenter> => 
    apiClient.request(`${BASE}/cost-centers`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<CostCenterFormData>): Promise<CostCenter> => 
    apiClient.request(`${BASE}/cost-centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/cost-centers/${id}`, { method: 'DELETE' }),
};

// Taxes API
export const taxesApi = {
  getAll: (): Promise<Tax[]> => apiClient.request(`${BASE}/taxes`),
  getById: (id: number): Promise<Tax> => apiClient.request(`${BASE}/taxes/${id}`),
  create: (data: TaxFormData): Promise<Tax> => 
    apiClient.request(`${BASE}/taxes`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<TaxFormData>): Promise<Tax> => 
    apiClient.request(`${BASE}/taxes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number): Promise<void> => 
    apiClient.request(`${BASE}/taxes/${id}`, { method: 'DELETE' }),
};
