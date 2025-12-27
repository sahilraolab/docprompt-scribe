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
import { useMasterUOMs, useCreateMasterUOM, useUpdateMasterUOM } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { UOMFormData, UOM } from '@/types/masters';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  code: z.string().min(1, 'Code is required').max(10),
  description: z.string().max(200).optional(),
});

export default function UOMForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: uoms = [], isLoading } = useMasterUOMs();
  const createUOM = useCreateMasterUOM();
  const updateUOM = useUpdateMasterUOM();

  const existingUOM = isEdit ? uoms.find((u: UOM) => u.id === Number(id)) : null;

  const form = useForm<UOMFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    if (existingUOM) {
      form.reset({
        name: existingUOM.name,
        code: existingUOM.code,
        description: existingUOM.description || '',
      });
    }
  }, [existingUOM, form]);

  const onSubmit = (data: UOMFormData) => {
    if (isEdit) {
      updateUOM.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/masters/uoms') }
      );
    } else {
      createUOM.mutate(data, { onSuccess: () => navigate('/masters/uoms') });
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit UOM' : 'New UOM'}
        description={isEdit ? 'Update unit of measure' : 'Create a new unit of measure'}
        actions={[
          { label: 'Back', onClick: () => navigate('/masters/uoms'), icon: ArrowLeft, variant: 'outline' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>UOM Details</CardTitle>
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
                      <FormLabel>UOM Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="KG" {...field} />
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
                      <FormLabel>UOM Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Kilogram" {...field} />
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
                <Button type="button" variant="outline" onClick={() => navigate('/masters/uoms')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUOM.isPending || updateUOM.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update' : 'Create'} UOM
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
