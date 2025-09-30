import { useQuery } from '@tanstack/react-query';
import { CompanyProfile, FinancialYear, SystemSettings } from '@/types';

export const useCompanyProfile = () => {
  return useQuery<CompanyProfile>({
    queryKey: ['company-profile'],
    queryFn: async () => {
      const res = await fetch('/api/company-profile');
      return res.json();
    },
  });
};

export const useFinancialYears = () => {
  return useQuery<FinancialYear[]>({
    queryKey: ['financial-years'],
    queryFn: async () => {
      const res = await fetch('/api/financial-years');
      const data = await res.json();
      return data.data;
    },
  });
};

export const useSystemSettings = () => {
  return useQuery<SystemSettings>({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const res = await fetch('/api/system-settings');
      return res.json();
    },
  });
};
