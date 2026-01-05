import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/SearchableSelect';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { useProjects } from '@/lib/hooks/useProjects';
import { useRequisitions, useCreateRFQ } from '@/lib/hooks/usePurchase';
import { useMasterSuppliers } from '@/lib/hooks/useMasters';

import { toast } from 'sonner';

/* =====================================================
   VALIDATION
===================================================== */

const rfqSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  requisitionId: z.string().min(1, 'Material Requisition is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  closingDate: z.string().optional(),
});

type RFQFormData = z.infer<typeof rfqSchema>;

/* =====================================================
   COMPONENT
===================================================== */

export default function RFQForm() {
  const navigate = useNavigate();

  /* ===================== DATA ===================== */

  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: suppliers = [], isLoading: loadingSuppliers } =
    useMasterSuppliers();

  const createRFQ = useCreateRFQ();

  /* ===================== FORM ===================== */

  const form = useForm<RFQFormData>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      projectId: '',
      requisitionId: '',
      supplierId: '',
      closingDate: '',
    },
  });

  const projectId = form.watch('projectId');

  /* ===================== MRs (PROJECT-SCOPED) ===================== */

  const { data: mrs = [], isLoading: loadingMRs } = useRequisitions(
    projectId ? { projectId: Number(projectId) } : undefined,
    { enabled: !!projectId }
  );

  /* ===================== FILTER ELIGIBLE MRs ===================== */

  const eligibleMRs = useMemo(
    () =>
      mrs.filter(
        (mr: any) =>
          mr.status === 'SUBMITTED' || mr.status === 'APPROVED'
      ),
    [mrs]
  );

  /* ===================== OPTIONS ===================== */

  const projectOptions = projects.map((p: any) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
  }));

  const mrOptions = eligibleMRs.map((mr: any) => ({
    value: String(mr.id),
    label: `${mr.reqNo} (${mr.status})`,
  }));

  const supplierOptions = suppliers.map((s: any) => ({
    value: String(s.id),
    label: s.name,
  }));

  /* ===================== SUBMIT ===================== */

  const onSubmit = (data: RFQFormData) => {
    createRFQ.mutate(
      {
        requisitionId: Number(data.requisitionId),
        supplierId: Number(data.supplierId),
        closingDate: data.closingDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success('RFQ created successfully');
          navigate('/purchase/rfqs');
        },
      }
    );
  };

  /* ===================== LOADING ===================== */

  const isLoading =
    loadingProjects || loadingSuppliers || (projectId && loadingMRs);
  const isSaving = createRFQ.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/purchase/rfqs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Create RFQ</h1>
          <p className="text-muted-foreground">
            Send request for quotation to supplier
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>RFQ Details</CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* Project */}
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
                          onChange={(val) => {
                            field.onChange(val);
                            form.setValue('requisitionId', '');
                          }}
                          placeholder="Select project..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* MR */}
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
                          placeholder={
                            projectId
                              ? 'Select MR...'
                              : 'Select project first'
                          }
                          disabled={!projectId}
                          emptyMessage="No SUBMITTED / APPROVED MRs"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Supplier */}
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Closing Date */}
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

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Save className="h-4 w-4 mr-2" />
                  Create RFQ
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/purchase/rfqs')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> RFQs can only be created for Material
            Requisitions with status{' '}
            <span className="font-medium text-foreground">SUBMITTED</span>{' '}
            or{' '}
            <span className="font-medium text-foreground">APPROVED</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
