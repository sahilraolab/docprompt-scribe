import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Partner, ProjectInvestment, ProfitEvent } from '@/types/partners';
import { partnersApi } from '../api/partnersApi';
import { useToast } from '@/hooks/use-toast';

// Partners
export const usePartners = () => {
  return useQuery({
    queryKey: ['partners'],
    queryFn: () => partnersApi.getPartners(),
  });
};

export const usePartner = (id?: string) => {
  return useQuery({
    queryKey: ['partners', id],
    queryFn: () => partnersApi.getPartner(id!),
    enabled: !!id && id !== 'new',
  });
};

export const useCreatePartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.createPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Partner created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create partner', variant: 'destructive' });
    },
  });
};

export const useUpdatePartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Partner> }) =>
      partnersApi.updatePartner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Partner updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update partner', variant: 'destructive' });
    },
  });
};

export const useDeletePartner = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.deletePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      toast({ title: 'Success', description: 'Partner deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete partner', variant: 'destructive' });
    },
  });
};

// Project Investments
export const useInvestments = () => {
  return useQuery({
    queryKey: ['investments'],
    queryFn: () => partnersApi.getInvestments(),
  });
};

export const useInvestment = (id?: string) => {
  return useQuery({
    queryKey: ['investments', id],
    queryFn: () => partnersApi.getInvestment(id!),
    enabled: !!id && id !== 'new',
  });
};

export const useCreateInvestment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.createInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Success', description: 'Investment created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create investment', variant: 'destructive' });
    },
  });
};

export const useUpdateInvestment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectInvestment> }) =>
      partnersApi.updateInvestment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Success', description: 'Investment updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update investment', variant: 'destructive' });
    },
  });
};

export const useDeleteInvestment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.deleteInvestment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      toast({ title: 'Success', description: 'Investment deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete investment', variant: 'destructive' });
    },
  });
};

// Profit Events
export const useProfitEvents = () => {
  return useQuery({
    queryKey: ['profit-events'],
    queryFn: () => partnersApi.getProfitEvents(),
  });
};

export const useProfitEvent = (id?: string) => {
  return useQuery({
    queryKey: ['profit-events', id],
    queryFn: () => partnersApi.getProfitEvent(id!),
    enabled: !!id && id !== 'new',
  });
};

export const useCreateProfitEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.createProfitEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-events'] });
      toast({ title: 'Success', description: 'Profit event created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create profit event', variant: 'destructive' });
    },
  });
};

export const useUpdateProfitEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProfitEvent> }) =>
      partnersApi.updateProfitEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-events'] });
      toast({ title: 'Success', description: 'Profit event updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update profit event', variant: 'destructive' });
    },
  });
};

export const useDeleteProfitEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.deleteProfitEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-events'] });
      toast({ title: 'Success', description: 'Profit event deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete profit event', variant: 'destructive' });
    },
  });
};

export const useApproveProfitEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.approveProfitEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-events'] });
      toast({ title: 'Success', description: 'Profit event approved successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve profit event', variant: 'destructive' });
    },
  });
};

export const useDistributeProfitEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: partnersApi.distributeProfitEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profit-events'] });
      queryClient.invalidateQueries({ queryKey: ['distributions'] });
      toast({ title: 'Success', description: 'Profit distributed successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to distribute profit', variant: 'destructive' });
    },
  });
};

// Distributions
export const useDistributions = () => {
  return useQuery({
    queryKey: ['distributions'],
    queryFn: () => partnersApi.getDistributions(),
  });
};

export const useDistribution = (id?: string) => {
  return useQuery({
    queryKey: ['distributions', id],
    queryFn: () => partnersApi.getDistribution(id!),
    enabled: !!id,
  });
};
