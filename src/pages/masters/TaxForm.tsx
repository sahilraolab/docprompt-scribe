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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useMasterTax, useCreateMasterTax, useUpdateMasterTax } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { TaxFormData } from '@/types/masters';

const TAX_TYPES = [
  { value: 'GST', label: 'GST' },
  { value: 'CGST', label: 'CGST' },
  { value: 'SGST', label: 'SGST' },
  { value: 'IGST', label: 'IGST' },
  { value: 'VAT', label: 'VAT' },
  { value: 'CESS', label: 'CESS' },
  { value: 'OTHER', label: 'Other' },
];

const schema = z.object({
  code: z.string().min(1, 'Code is required').max(20),
  name: z.string().min(1, 'Name is required').max(100),
  rate: z.coerce.number().min(0).max(100),
  type: z.enum(['GST', 'CGST', 'SGST', 'IGST', 'VAT', 'CESS', 'OTHER']),
  accountId: z.coerce.number().optional(),
  description: z.string().max(500).optional(),
});

export default function TaxForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: tax, isLoading } = useMasterTax(Number(id));
  const createTax = useCreateMasterTax();
  const updateTax = useUpdateMasterTax();

  const form = useForm<TaxFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      rate: 0,
      type: 'GST',
      accountId: undefined,
      description: '',
    },
  });

  useEffect(() => {
    if (tax) {
      form.reset({
        code: tax.code,
        name: tax.name,
        rate: tax.rate,
        type: tax.type,
        accountId: tax.accountId,
        description: tax.description || '',
      });
    }
  }, [tax, form]);

  const onSubmit = (data: TaxFormData) => {
    if (isEdit) {
      updateTax.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/masters/taxes') }
      );
    } else {
      createTax.mutate(data, { onSuccess: () => navigate('/masters/taxes') });
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Tax' : 'New Tax'}
        description={isEdit ? 'Update tax configuration' : 'Create a new tax rate'}
        actions={[
          { label: 'Back', onClick: () => navigate('/masters/taxes'), icon: ArrowLeft, variant: 'outline' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tax Details</CardTitle>
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
                      <FormLabel>Tax Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="GST18" disabled={isEdit} {...field} />
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
                      <FormLabel>Tax Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="GST 18%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (%) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="18" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TAX_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ledger Account ID</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Account ID" {...field} />
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
                <Button type="button" variant="outline" onClick={() => navigate('/masters/taxes')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createTax.isPending || updateTax.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update' : 'Create'} Tax
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
