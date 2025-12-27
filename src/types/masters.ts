// Masters Module Types

export interface Project {
  id: number;
  name: string;
  code: string;
  location?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  companyId?: number;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: number;
  name: string;
  code: string;
  category: string;
  uomId?: number;
  uom?: UOM;
  hsnCode?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNo?: string;
  panNo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNo?: string;
  panNo?: string;
  contactPerson?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UOM {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: number;
  name: string;
  code: string;
  description?: string;
  projectId?: number;
  project?: Project;
  createdAt: string;
  updatedAt: string;
}

export interface Tax {
  id: number;
  name: string;
  code: string;
  rate: number;
  type: 'GST' | 'CGST' | 'SGST' | 'IGST' | 'CESS' | 'OTHER';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface ProjectFormData {
  name: string;
  code: string;
  location?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  companyId?: number;
}

export interface MaterialFormData {
  name: string;
  code: string;
  category: string;
  uomId?: number;
  hsnCode?: string;
  description?: string;
}

export interface CompanyFormData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNo?: string;
  panNo?: string;
}

export interface SupplierFormData {
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNo?: string;
  panNo?: string;
  contactPerson?: string;
}

export interface UOMFormData {
  name: string;
  code: string;
  description?: string;
}

export interface DepartmentFormData {
  name: string;
  code: string;
  description?: string;
}

export interface CostCenterFormData {
  name: string;
  code: string;
  description?: string;
  projectId?: number;
}

export interface TaxFormData {
  name: string;
  code: string;
  rate: number;
  type: 'GST' | 'CGST' | 'SGST' | 'IGST' | 'CESS' | 'OTHER';
  description?: string;
}
