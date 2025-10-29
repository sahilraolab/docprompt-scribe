import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Account, Journal, CostCentre, TaxConfig } from '@/types';
import { accountsApi } from '../api/accountsApi';
import { useToast } from '@/hooks/use-toast';

// Accounts
export const useAccounts = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAccounts(),
  });
};

export const useAccount = (id?: string) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountsApi.getAccount(id!),
    enabled: !!id,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: 'Success', description: 'Account created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create account', variant: 'destructive' });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) =>
      accountsApi.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: 'Success', description: 'Account updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update account', variant: 'destructive' });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({ title: 'Success', description: 'Account deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
    },
  });
};

// Journals
export const useJournals = () => {
  return useQuery({
    queryKey: ['journals'],
    queryFn: () => accountsApi.getJournals(),
  });
};

export const useJournal = (id?: string) => {
  return useQuery({
    queryKey: ['journals', id],
    queryFn: () => accountsApi.getJournal(id!),
    enabled: !!id,
  });
};

export const useCreateJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.createJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast({ title: 'Success', description: 'Journal created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create journal', variant: 'destructive' });
    },
  });
};

export const useUpdateJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Journal> }) =>
      accountsApi.updateJournal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast({ title: 'Success', description: 'Journal updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update journal', variant: 'destructive' });
    },
  });
};

export const useDeleteJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.deleteJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast({ title: 'Success', description: 'Journal deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete journal', variant: 'destructive' });
    },
  });
};

export const usePostJournal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.postJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast({ title: 'Success', description: 'Journal posted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to post journal', variant: 'destructive' });
    },
  });
};

// Ledgers
export const useLedgers = () => {
  return useQuery({
    queryKey: ['ledgers'],
    queryFn: () => accountsApi.getLedgers(),
  });
};

export const useLedger = (accountId: string, params?: { fromDate?: string; toDate?: string }) => {
  return useQuery({
    queryKey: ['ledgers', accountId, params],
    queryFn: () => accountsApi.getLedger(accountId, params),
    enabled: !!accountId,
  });
};

// Cost Centres
export const useCostCentres = () => {
  return useQuery({
    queryKey: ['cost-centres'],
    queryFn: () => accountsApi.getCostCentres(),
  });
};

export const useCostCentre = (id?: string) => {
  return useQuery({
    queryKey: ['cost-centres', id],
    queryFn: () => accountsApi.getCostCentre(id!),
    enabled: !!id,
  });
};

export const useCreateCostCentre = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.createCostCentre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centres'] });
      toast({ title: 'Success', description: 'Cost centre created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create cost centre', variant: 'destructive' });
    },
  });
};

export const useUpdateCostCentre = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CostCentre> }) =>
      accountsApi.updateCostCentre(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centres'] });
      toast({ title: 'Success', description: 'Cost centre updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update cost centre', variant: 'destructive' });
    },
  });
};

export const useDeleteCostCentre = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.deleteCostCentre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-centres'] });
      toast({ title: 'Success', description: 'Cost centre deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete cost centre', variant: 'destructive' });
    },
  });
};

// Tax Configs
export const useTaxConfigs = () => {
  return useQuery({
    queryKey: ['tax-configs'],
    queryFn: () => accountsApi.getTaxConfigs(),
  });
};

export const useTaxConfig = (id?: string) => {
  return useQuery({
    queryKey: ['tax-configs', id],
    queryFn: () => accountsApi.getTaxConfig(id!),
    enabled: !!id,
  });
};

export const useCreateTaxConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.createTaxConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-configs'] });
      toast({ title: 'Success', description: 'Tax config created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create tax config', variant: 'destructive' });
    },
  });
};

export const useUpdateTaxConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaxConfig> }) =>
      accountsApi.updateTaxConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-configs'] });
      toast({ title: 'Success', description: 'Tax config updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update tax config', variant: 'destructive' });
    },
  });
};

export const useDeleteTaxConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: accountsApi.deleteTaxConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-configs'] });
      toast({ title: 'Success', description: 'Tax config deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete tax config', variant: 'destructive' });
    },
  });
};

// Reports
export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: () => accountsApi.getFinancialSummary(),
  });
};
