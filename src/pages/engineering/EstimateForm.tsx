import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useEstimate, useCreateEstimate, useAddEstimateVersion } from '@/lib/hooks/useEngineering';
import { useMaterialMaster } from '@/lib/hooks/useMaterialMaster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash, Loader2 } from 'lucide-react';

const estimateSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Estimate name is required'),
  baseAmount: z.string().min(1, 'Base amount is required'),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

export default function EstimateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: projectsData } = useMasterProjects();
  const { data: estimateData } = useEstimate(isEdit ? (id as string) : '');
  const createEstimate = useCreateEstimate();
  const addEstimateVersion = useAddEstimateVersion();

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      projectId: '',
      name: '',
      baseAmount: '',
    },
  });

  const projectsArray = Array.isArray(projectsData) ? projectsData : [];

  useEffect(() => {
    if (isEdit && estimateData) {
      form.reset({
        projectId: String(estimateData.projectId || ''),
        name: estimateData.name || '',
        baseAmount: String(estimateData.baseAmount || ''),
      });
    }
  }, [isEdit, estimateData, form]);

  const onSubmit = async (data: EstimateFormData) => {
    try {
      const payload = {
        projectId: Number(data.projectId),
        name: data.name,
        baseAmount: Number(data.baseAmount),
      };

      if (isEdit && id) {
        await addEstimateVersion.mutateAsync({ estimateId: Number(id), amount: payload.baseAmount });
        toast.success('Estimate version added successfully');
      } else {
        await createEstimate.mutateAsync(payload);
        toast.success('Estimate created successfully');
      }

      navigate('/engineering/estimates');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save estimate');
    }
  };

  const projectOptions = projectsArray.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/estimates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Estimate</h1>
          <p className="text-muted-foreground">Create project cost estimate</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={projectOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select project"
                        searchPlaceholder="Search projects..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimate Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Phase 1 Estimate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Amount (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder="Enter base amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createEstimate.isPending || addEstimateVersion.isPending}>
              {(createEstimate.isPending || addEstimateVersion.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? 'Add Version' : 'Create Estimate'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/estimates')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
