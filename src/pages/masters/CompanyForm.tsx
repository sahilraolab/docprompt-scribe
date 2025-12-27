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
import { useMasterCompanies, useCreateMasterCompany, useUpdateMasterCompany } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { CompanyFormData, Company } from '@/types/masters';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(100).optional().or(z.literal('')),
  gstNo: z.string().max(20).optional(),
  panNo: z.string().max(20).optional(),
});

export default function CompanyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: companies = [], isLoading } = useMasterCompanies();
  const createCompany = useCreateMasterCompany();
  const updateCompany = useUpdateMasterCompany();

  const existingCompany = isEdit ? companies.find((c: Company) => c.id === Number(id)) : null;

  const form = useForm<CompanyFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      gstNo: '',
      panNo: '',
    },
  });

  useEffect(() => {
    if (existingCompany) {
      form.reset({
        name: existingCompany.name,
        code: existingCompany.code,
        address: existingCompany.address || '',
        phone: existingCompany.phone || '',
        email: existingCompany.email || '',
        gstNo: existingCompany.gstNo || '',
        panNo: existingCompany.panNo || '',
      });
    }
  }, [existingCompany, form]);

  const onSubmit = (data: CompanyFormData) => {
    if (isEdit) {
      updateCompany.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/masters/companies') }
      );
    } else {
      createCompany.mutate(data, { onSuccess: () => navigate('/masters/companies') });
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Company' : 'New Company'}
        description={isEdit ? 'Update company details' : 'Create a new company'}
        actions={[
          { label: 'Back', onClick: () => navigate('/masters/companies'), icon: ArrowLeft, variant: 'outline' }
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
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
                      <FormLabel>Company Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="CMP001" {...field} />
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
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
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
                        <Input type="email" placeholder="company@example.com" {...field} />
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
                      <Textarea placeholder="Company address..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/masters/companies')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCompany.isPending || updateCompany.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update' : 'Create'} Company
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
