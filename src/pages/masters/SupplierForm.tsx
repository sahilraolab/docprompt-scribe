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
import { useMasterSuppliers, useCreateMasterSupplier, useUpdateMasterSupplier } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { SupplierFormData, Supplier } from '@/types/masters';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
  gstNo: z.string().max(20).optional(),
  panNo: z.string().max(20).optional(),
  contactPerson: z.string().max(100).optional(),
});

export default function SupplierForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: suppliers = [], isLoading } = useMasterSuppliers();
  const createSupplier = useCreateMasterSupplier();
  const updateSupplier = useUpdateMasterSupplier();

  const existingSupplier = isEdit ? suppliers.find((s: Supplier) => s.id === Number(id)) : null;

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      gstNo: '',
      panNo: '',
      contactPerson: '',
    },
  });

  useEffect(() => {
    if (existingSupplier) {
      form.reset({
        name: existingSupplier.name,
        code: existingSupplier.code,
        address: existingSupplier.address || '',
        phone: existingSupplier.phone || '',
        email: existingSupplier.email || '',
        gstNo: existingSupplier.gstNo || '',
        panNo: existingSupplier.panNo || '',
        contactPerson: existingSupplier.contactPerson || '',
      });
    }
  }, [existingSupplier, form]);

  const onSubmit = (data: SupplierFormData) => {
    if (isEdit) {
      updateSupplier.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/masters/suppliers') }
      );
    } else {
      createSupplier.mutate(data, { onSuccess: () => navigate('/masters/suppliers') });
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Supplier' : 'New Supplier'}
        description={isEdit ? 'Update supplier details' : 'Create a new supplier'}
        actions={[
          { label: 'Back', onClick: () => navigate('/masters/suppliers'), icon: ArrowLeft, variant: 'outline' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Supplier Details</CardTitle>
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
                      <FormLabel>Supplier Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="SUP001" {...field} />
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
                      <FormLabel>Supplier Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Supplier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact person name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="supplier@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gstNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST No.</FormLabel>
                      <FormControl>
                        <Input placeholder="GST number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="panNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN No.</FormLabel>
                      <FormControl>
                        <Input placeholder="PAN number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Supplier address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/masters/suppliers')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSupplier.isPending || updateSupplier.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update' : 'Create'} Supplier
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
