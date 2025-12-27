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
import { useMasterDepartments, useCreateMasterDepartment, useUpdateMasterDepartment } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { DepartmentFormData, Department } from '@/types/masters';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20),
  headName: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

export default function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: departments = [], isLoading } = useMasterDepartments();
  const createDepartment = useCreateMasterDepartment();
  const updateDepartment = useUpdateMasterDepartment();

  const existingDepartment = isEdit ? departments.find((d: Department) => d.id === Number(id)) : null;

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      headName: '',
      description: '',
    },
  });

  useEffect(() => {
    if (existingDepartment) {
      form.reset({
        name: existingDepartment.name,
        code: existingDepartment.code,
        headName: existingDepartment.headName || '',
        description: existingDepartment.description || '',
      });
    }
  }, [existingDepartment, form]);

  const onSubmit = (data: DepartmentFormData) => {
    if (isEdit) {
      updateDepartment.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/masters/departments') }
      );
    } else {
      createDepartment.mutate(data, { onSuccess: () => navigate('/masters/departments') });
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Department' : 'New Department'}
        description={isEdit ? 'Update department details' : 'Create a new department'}
        actions={[
          { label: 'Back', onClick: () => navigate('/masters/departments'), icon: ArrowLeft, variant: 'outline' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
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
                      <FormLabel>Department Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="HR" {...field} />
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
                      <FormLabel>Department Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Human Resources" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Head</FormLabel>
                      <FormControl>
                        <Input placeholder="Head name" {...field} />
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
                <Button type="button" variant="outline" onClick={() => navigate('/masters/departments')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createDepartment.isPending || updateDepartment.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update' : 'Create'} Department
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
