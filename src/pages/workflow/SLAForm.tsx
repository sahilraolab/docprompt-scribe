import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  useSLAConfig,
  useCreateSLAConfig,
  useUpdateSLAConfig,
} from '@/lib/hooks/useWorkflow';

const slaSchema = z.object({
  module: z.string().min(1, 'Module is required'),
  entity: z.string().min(1, 'Entity type is required'),
  slaHours: z.number().min(1, 'SLA hours must be at least 1'),
  escalateRole: z.string().optional(),
  active: z.boolean(),
});

type SLAFormData = z.infer<typeof slaSchema>;

export default function SLAForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: sla, isLoading: isLoadingSLA } = useSLAConfig(id);
  const createSLA = useCreateSLAConfig();
  const updateSLA = useUpdateSLAConfig();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SLAFormData>({
    resolver: zodResolver(slaSchema),
    defaultValues: {
      active: true,
      slaHours: 24,
    },
  });

  useEffect(() => {
    if (sla && isEdit) {
      setValue('module', sla.module);
      setValue('entity', sla.entity);
      setValue('slaHours', sla.slaHours);
      setValue('escalateRole', sla.escalateRole);
      setValue('active', sla.active);
    }
  }, [sla, isEdit, setValue]);

  const module = watch('module');
  const active = watch('active');

  const onSubmit = async (data: SLAFormData) => {
    try {
      const slaData = {
        module: data.module,
        entity: data.entity,
        slaHours: data.slaHours,
        escalateRole: data.escalateRole as any,
        notifyRoles: [],
        active: data.active,
      };

      if (isEdit && id) {
        await updateSLA.mutateAsync({ id, data: slaData });
      } else {
        await createSLA.mutateAsync(slaData);
      }
      navigate('/workflow/sla');
    } catch (error) {
      console.error('Failed to save SLA:', error);
    }
  };

  if (isEdit && isLoadingSLA) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const moduleOptions = [
    { value: 'Purchase', label: 'Purchase' },
    { value: 'Contracts', label: 'Contracts' },
    { value: 'Accounts', label: 'Accounts' },
    { value: 'Site', label: 'Site' },
    { value: 'Engineering', label: 'Engineering' },
  ];

  const entityTypesByModule: Record<string, { value: string; label: string }[]> = {
    Purchase: [
      { value: 'MR', label: 'Material Requisition' },
      { value: 'PO', label: 'Purchase Order' },
      { value: 'Quotation', label: 'Quotation' },
    ],
    Contracts: [
      { value: 'WO', label: 'Work Order' },
      { value: 'RABill', label: 'RA Bill' },
    ],
    Accounts: [
      { value: 'Journal', label: 'Journal Entry' },
      { value: 'Payment', label: 'Payment' },
    ],
    Site: [
      { value: 'GRN', label: 'GRN' },
      { value: 'Issue', label: 'Material Issue' },
    ],
    Engineering: [
      { value: 'BOQ', label: 'BOQ' },
      { value: 'Estimate', label: 'Estimate' },
    ],
  };

  const roleOptions = [
    { value: 'Manager', label: 'Manager' },
    { value: 'Director', label: 'Director' },
    { value: 'Admin', label: 'Admin' },
    { value: 'ProjectManager', label: 'Project Manager' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workflow/sla')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} SLA</h1>
          <p className="text-muted-foreground">Service level agreement configuration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>SLA Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module">Module *</Label>
                <SearchableSelect
                  options={moduleOptions}
                  value={module}
                  onChange={(value) => setValue('module', value)}
                  placeholder="Select module"
                />
                {errors.module && (
                  <p className="text-sm text-destructive">{errors.module.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Entity Type *</Label>
                <SearchableSelect
                  options={module ? entityTypesByModule[module] || [] : []}
                  value={watch('entity')}
                  onChange={(value) => setValue('entity', value)}
                  placeholder="Select entity type"
                />
                {errors.entity && (
                  <p className="text-sm text-destructive">{errors.entity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slaHours">SLA Hours *</Label>
                <Input
                  type="number"
                  {...register('slaHours', { valueAsNumber: true })}
                  placeholder="Enter SLA hours"
                  min="1"
                />
                {errors.slaHours && (
                  <p className="text-sm text-destructive">{errors.slaHours.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalateRole">Escalate to Role</Label>
                <SearchableSelect
                  options={[{ value: '', label: 'None' }, ...roleOptions]}
                  value={watch('escalateRole') || ''}
                  onChange={(value) => setValue('escalateRole', value)}
                  placeholder="Select role"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Enable this SLA</p>
              </div>
              <Switch
                checked={active}
                onCheckedChange={(value) => setValue('active', value)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createSLA.isPending || updateSLA.isPending}
              >
                {(createSLA.isPending || updateSLA.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? 'Update SLA' : 'Create SLA'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/workflow/sla')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
