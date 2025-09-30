import { useQuery } from '@tanstack/react-query';
import { Account, Journal, CostCentre, TaxConfig } from '@/types';

export const useAccounts = () => {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await fetch('/api/accounts');
      const data = await res.json();
      return data.data;
    },
  });
};

export const useJournals = () => {
  return useQuery<Journal[]>({
    queryKey: ['journals'],
    queryFn: async () => {
      const res = await fetch('/api/journals');
      const data = await res.json();
      return data.data;
    },
  });
};

export const useCostCentres = () => {
  return useQuery<CostCentre[]>({
    queryKey: ['cost-centres'],
    queryFn: async () => {
      const res = await fetch('/api/cost-centres');
      const data = await res.json();
      return data.data;
    },
  });
};

export const useTaxConfigs = () => {
  return useQuery<TaxConfig[]>({
    queryKey: ['tax-configs'],
    queryFn: async () => {
      const res = await fetch('/api/tax-configs');
      const data = await res.json();
      return data.data;
    },
  });
};
