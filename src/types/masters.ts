// Masters Module Types - Aligned with Backend Models

export interface Company {
  id: number;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  currency?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  code: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  companyId: number;
  company?: Company;
  budget?: number;
  startDate?: string;
  endDate?: string;
  status: 'PLANNED' | 'ONGOING' | 'ON_HOLD' | 'COMPLETED';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: number;
  name: string;
  code: string;
  category: string;
  uomId: number;
  uom?: UOM;
  sizeValue?: number;
  sizeUnit?: string;
  specification?: string;
  hsnCode?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UOM {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  departmentHead?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CostCenter {
  id: number;
  code: string;
  name: string;
  budget: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tax {
  id: number;
  code: string;
  name: string;
  rate: number;
  type: 'GST' | 'CGST' | 'SGST' | 'IGST' | 'VAT' | 'CESS' | 'OTHER';
  accountId?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface CompanyFormData {
  name: string;
  code: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  currency?: string;
}

export interface ProjectFormData {
  name: string;
  code: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  companyId: number;
  budget?: number;
  startDate?: string;
  endDate?: string;
  status: 'PLANNED' | 'ONGOING' | 'ON_HOLD' | 'COMPLETED';
  description?: string;
}

export interface MaterialFormData {
  name: string;
  code: string;
  category: string;
  uomId: number;
  sizeValue?: number;
  sizeUnit?: string;
  specification?: string;
  hsnCode?: string;
  description?: string;
}

export interface SupplierFormData {
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface UOMFormData {
  code: string;
  name: string;
  description?: string;
}

export interface DepartmentFormData {
  code: string;
  name: string;
  departmentHead?: string;
  description?: string;
}

export interface CostCenterFormData {
  code: string;
  name: string;
  budget: number;
  description?: string;
}

export interface TaxFormData {
  code: string;
  name: string;
  rate: number;
  type: 'GST' | 'CGST' | 'SGST' | 'IGST' | 'VAT' | 'CESS' | 'OTHER';
  accountId?: number;
  description?: string;
}
