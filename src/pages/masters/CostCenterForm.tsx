import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { ArrowLeft, Save } from 'lucide-react';
import { useMasterCostCenters, useCreateMasterCostCenter, useUpdateMasterCostCenter } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { CostCenterFormData, CostCenter } from '@/types/masters';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20),
  budget: z.coerce.number().min(0).optional(),
  description: z.string().max(500).optional(),
});

export default function CostCenterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: costCenters = [], isLoading } = useMasterCostCenters();
  const createCostCenter = useCreateMasterCostCenter();
  const updateCostCenter = useUpdateMasterCostCenter();

  const existingCostCenter = isEdit ? costCenters.find((c: CostCenter) => c.id === Number(id)) : null;

  const form = useForm<CostCenterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      budget: undefined,
      description: '',
    },
  });

  useEffect(() => {
    if (existingCostCenter) {
      form.reset({
        name: existingCostCenter.name,
        code: existingCostCenter.code,
        budget: existingCostCenter.budget,
        description: existingCostCenter.description || '',
      });
    }
  }, [existingCostCenter, form]);

  const onSubmit = (data: CostCenterFormData) => {
    if (isEdit) {
      updateCostCenter.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/masters/cost-centers') }
      );
    } else {
      createCostCenter.mutate(data, { onSuccess: () => navigate('/masters/cost-centers') });
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Cost Center' : 'New Cost Center'}
        description={isEdit ? 'Update cost center details' : 'Create a new cost center'}
        actions={[
          { label: 'Back', onClick: () => navigate('/masters/cost-centers'), icon: ArrowLeft, variant: 'outline' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Cost Center Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost Center Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="CC001" {...field} />
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
                      <FormLabel>Cost Center Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Administration" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => navigate('/masters/cost-centers')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createCostCenter.isPending || updateCostCenter.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update' : 'Create'} Cost Center
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
