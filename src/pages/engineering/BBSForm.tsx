import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterProjects, useMasterUOMs } from '@/lib/hooks/useMasters';
import { useBBS, useCreateBBS, useUpdateBBS } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Loader2, Lock, Calculator } from 'lucide-react';

const bbsSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required'),
  uomId: z.string().min(1, 'UOM is required'),
  rate: z.string().min(1, 'Rate is required'),
});

type BBSFormData = z.infer<typeof bbsSchema>;

export default function BBSForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: projects = [] } = useMasterProjects();
  const { data: uoms = [] } = useMasterUOMs();
  const { data: bbsData } = useBBS(isEdit ? id : '');
  const createBBS = useCreateBBS();
  const updateBBS = useUpdateBBS();

  const form = useForm<BBSFormData>({
    resolver: zodResolver(bbsSchema),
    defaultValues: {
      projectId: '',
      code: '',
      description: '',
      quantity: '',
      uomId: '',
      rate: '',
    },
  });

  const projectsArray = Array.isArray(projects) ? projects : [];
  const uomsArray = Array.isArray(uoms) ? uoms : [];

  // Check if BBS is locked (APPROVED status)
  const isLocked = useMemo(() => {
    if (!bbsData) return false;
    return bbsData.status === 'APPROVED';
  }, [bbsData]);

  // Auto-calculate amount
  const quantity = parseFloat(form.watch('quantity') || '0');
  const rate = parseFloat(form.watch('rate') || '0');
  const calculatedAmount = useMemo(() => quantity * rate, [quantity, rate]);

  useEffect(() => {
    if (isEdit && bbsData) {
      form.reset({
        projectId: String(bbsData.projectId || ''),
        code: bbsData.code || '',
        description: bbsData.description || '',
        quantity: String(bbsData.quantity || ''),
        uomId: String(bbsData.uomId || ''),
        rate: String(bbsData.rate || ''),
      });
    }
  }, [isEdit, bbsData, form]);

  const onSubmit = async (data: BBSFormData) => {
    const payload = {
      ...data,
      projectId: Number(data.projectId),
      uomId: Number(data.uomId),
      quantity: Number(data.quantity),
      rate: Number(data.rate),
      // Amount is auto-calculated on backend
    };

    if (isEdit && id) {
      await updateBBS.mutateAsync({ id, data: payload });
    } else {
      await createBBS.mutateAsync(payload);
    }
    navigate('/engineering/bbs');
  };

  const projectOptions = projectsArray.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`,
  }));

  const uomOptions = uomsArray.map((u: any) => ({
    value: String(u.id),
    label: `${u.code} - ${u.name}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/bbs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} BBS</h1>
          <p className="text-muted-foreground">Bar Bending Schedule entry</p>
        </div>
        {isLocked && (
          <div className="ml-auto flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Locked (Approved)</span>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BBS Details</CardTitle>
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
                        disabled={isLocked}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BBS-001" disabled={isLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} placeholder="Description..." disabled={isLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} disabled={isLocked} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UOM *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={uomOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select UOM"
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled={isLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Auto-calculated Amount (Disabled) */}
              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Auto-Calculated</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Amount (Quantity × Rate)</span>
                  <span className="text-lg font-bold">
                    ₹{calculatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            {!isLocked && (
              <Button type="submit" disabled={createBBS.isPending || updateBBS.isPending}>
                {(createBBS.isPending || updateBBS.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isEdit ? 'Update BBS' : 'Create BBS'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/bbs')}>
              {isLocked ? 'Back' : 'Cancel'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}