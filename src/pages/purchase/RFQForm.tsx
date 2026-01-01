import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useCreateRFQ, useMRs, useSuppliers, useRFQ, useUpdateRFQ } from '@/lib/hooks/usePurchaseBackend';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const rfqSchema = z.object({
  requisitionId: z.string().min(1, 'Material Requisition is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  closingDate: z.string().optional(),
});

type RFQFormData = z.infer<typeof rfqSchema>;

export default function RFQForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { data: rfqData, isLoading: loadingRFQ } = useRFQ(id || '');
  const { data: mrs = [], isLoading: loadingMRs } = useMRs();
  const { data: suppliers = [], isLoading: loadingSuppliers } = useSuppliers();
  const createRFQ = useCreateRFQ();
  const updateRFQ = useUpdateRFQ();

  // Filter MRs that are SUBMITTED or APPROVED (eligible for RFQ)
  const eligibleMRs = mrs.filter((mr: any) => 
    mr.status === 'SUBMITTED' || mr.status === 'APPROVED' || mr.status === 'Approved'
  );

  const mrOptions = eligibleMRs.map((mr: any) => ({
    value: mr._id || mr.id,
    label: `${mr.code} - ${mr.projectId?.name || 'N/A'}`,
  }));

  const supplierOptions = suppliers.map((s: any) => ({
    value: s._id || s.id,
    label: s.name,
  }));

  const form = useForm<RFQFormData>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      requisitionId: '',
      supplierId: '',
      closingDate: '',
    },
  });

  useEffect(() => {
    if (rfqData && isEditing) {
      const rfq = rfqData.data || rfqData;
      form.reset({
        requisitionId: rfq.requisitionId?._id || rfq.requisitionId || '',
        supplierId: rfq.supplierId?._id || rfq.supplierId || '',
        closingDate: rfq.closingDate?.slice(0, 10) || '',
      });
    }
  }, [rfqData, isEditing, form]);

  const onSubmit = (data: RFQFormData) => {
    const payload = {
      ...data,
      closingDate: data.closingDate || undefined,
    };

    if (isEditing) {
      updateRFQ.mutate({ id: id!, data: payload }, {
        onSuccess: () => navigate('/purchase/rfqs'),
      });
    } else {
      createRFQ.mutate(payload, {
        onSuccess: () => navigate('/purchase/rfqs'),
      });
    }
  };

  const isLoading = loadingMRs || loadingSuppliers || (isEditing && loadingRFQ);
  const isSaving = createRFQ.isPending || updateRFQ.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/rfqs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? 'Edit RFQ' : 'Create RFQ'}</h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update RFQ details' : 'Send request for quotation to a supplier'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RFQ Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="requisitionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Requisition *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={mrOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select MR..."
                          emptyMessage="No eligible MRs (must be SUBMITTED)"
                          disabled={isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={supplierOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select supplier..."
                          emptyMessage="No suppliers found"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update RFQ' : 'Create RFQ'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/purchase/rfqs')}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> RFQs can only be created for Material Requisitions with status 
            <span className="font-medium text-foreground"> SUBMITTED</span> or 
            <span className="font-medium text-foreground"> APPROVED</span>. 
            Once an RFQ is created, suppliers can submit their quotations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
