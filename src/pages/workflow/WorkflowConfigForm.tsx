import { useState, useEffect } from 'react';
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
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  useWorkflowConfig,
  useCreateWorkflowConfig,
  useUpdateWorkflowConfig,
} from '@/lib/hooks/useWorkflow';

const approvalLevelSchema = z.object({
  level: z.number().min(1),
  role: z.string().min(1, 'Role is required'),
  threshold: z.number().min(0).optional(),
});

const workflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  module: z.string().min(1, 'Module is required'),
  entity: z.string().min(1, 'Entity type is required'),
  slaHours: z.number().min(0).optional(),
  active: z.boolean(),
  levels: z.array(approvalLevelSchema).min(1, 'At least one approval level is required'),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

export default function WorkflowConfigForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const { data: workflow, isLoading: isLoadingWorkflow } = useWorkflowConfig(id);
  const createWorkflow = useCreateWorkflowConfig();
  const updateWorkflow = useUpdateWorkflowConfig();

  const [approvalLevels, setApprovalLevels] = useState<any[]>([
    { level: 1, role: '', threshold: 0 },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      active: true,
      slaHours: 24,
    },
  });

  useEffect(() => {
    if (workflow && isEdit) {
      setValue('name', workflow.name);
      setValue('module', workflow.module);
      setValue('entity', workflow.entity);
      setValue('slaHours', workflow.slaHours || 24);
      setValue('active', workflow.active);
      if (workflow.levels && workflow.levels.length > 0) {
        setApprovalLevels(
          workflow.levels.map((l, idx) => ({
            level: idx + 1,
            role: l.role,
            threshold: l.threshold || 0,
          }))
        );
      }
    }
  }, [workflow, isEdit, setValue]);

  const module = watch('module');
  const active = watch('active');

  const addLevel = () => {
    const nextLevel = approvalLevels.length + 1;
    setApprovalLevels([...approvalLevels, { level: nextLevel, role: '', threshold: 0 }]);
  };

  const removeLevel = (index: number) => {
    if (approvalLevels.length > 1) {
      const updated = approvalLevels.filter((_, i) => i !== index);
      setApprovalLevels(updated.map((l, idx) => ({ ...l, level: idx + 1 })));
    }
  };

  const updateLevel = (index: number, field: string, value: any) => {
    const updated = [...approvalLevels];
    updated[index] = { ...updated[index], [field]: value };
    setApprovalLevels(updated);
    setValue('levels', updated);
  };

  const onSubmit = async (data: WorkflowFormData) => {
    try {
      const workflowData = {
        name: data.name,
        module: data.module,
        entity: data.entity,
        slaHours: data.slaHours,
        active: data.active,
        levels: approvalLevels.map((l, idx) => ({
          id: `level-${idx + 1}`,
          level: idx + 1,
          role: l.role as any,
          threshold: l.threshold || 0,
        })),
      };

      if (isEdit && id) {
        await updateWorkflow.mutateAsync({ id, data: workflowData });
      } else {
        await createWorkflow.mutateAsync(workflowData);
      }
      navigate('/workflow/config');
    } catch (error) {
      console.error('Failed to save workflow:', error);
    }
  };

  if (isEdit && isLoadingWorkflow) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const roleOptions = [
    { value: 'Admin', label: 'Admin' },
    { value: 'ProjectManager', label: 'Project Manager' },
    { value: 'PurchaseOfficer', label: 'Purchase Officer' },
    { value: 'SiteEngineer', label: 'Site Engineer' },
    { value: 'Accountant', label: 'Accountant' },
    { value: 'Approver', label: 'Approver' },
    { value: 'FinanceManager', label: 'Finance Manager' },
  ];

  const moduleOptions = [
    { value: 'Purchase', label: 'Purchase' },
    { value: 'Contracts', label: 'Contracts' },
    { value: 'Accounts', label: 'Accounts' },
    { value: 'Site', label: 'Site' },
    { value: 'Engineering', label: 'Engineering' },
  ];

  const documentTypesByModule: Record<string, { value: string; label: string }[]> = {
    Purchase: [
      { value: 'MR', label: 'Material Requisition' },
      { value: 'PO', label: 'Purchase Order' },
      { value: 'Quotation', label: 'Quotation' },
      { value: 'PurchaseBill', label: 'Purchase Bill' },
    ],
    Contracts: [
      { value: 'WO', label: 'Work Order' },
      { value: 'RABill', label: 'RA Bill' },
      { value: 'Contractor', label: 'Contractor' },
    ],
    Accounts: [
      { value: 'Journal', label: 'Journal Entry' },
      { value: 'Payment', label: 'Payment' },
      { value: 'Receipt', label: 'Receipt' },
    ],
    Site: [
      { value: 'GRN', label: 'GRN' },
      { value: 'Issue', label: 'Material Issue' },
      { value: 'Transfer', label: 'Transfer' },
    ],
    Engineering: [
      { value: 'BOQ', label: 'BOQ' },
      { value: 'Estimate', label: 'Estimate' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workflow/config')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Workflow</h1>
          <p className="text-muted-foreground">Configure approval workflow and levels</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name *</Label>
              <Input {...register('name')} placeholder="Purchase Order Approval" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                  options={module ? documentTypesByModule[module] || [] : []}
                  value={watch('entity')}
                  onChange={(value) => setValue('entity', value)}
                  placeholder="Select entity type"
                />
                {errors.entity && (
                  <p className="text-sm text-destructive">{errors.entity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slaHours">SLA Hours</Label>
                <Input
                  type="number"
                  {...register('slaHours', { valueAsNumber: true })}
                  placeholder="24"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Enable this workflow</p>
              </div>
              <Switch
                checked={active}
                onCheckedChange={(value) => setValue('active', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Approval Levels</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addLevel}>
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvalLevels.map((level, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Level {index + 1}</h4>
                  {approvalLevels.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Approver Role *</Label>
                    <SearchableSelect
                      options={roleOptions}
                      value={level.role}
                      onChange={(value) => updateLevel(index, 'role', value)}
                      placeholder="Select role"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount Threshold (₹)</Label>
                    <Input
                      type="number"
                      value={level.threshold}
                      onChange={(e) =>
                        updateLevel(index, 'threshold', parseFloat(e.target.value) || 0)
                      }
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/workflow/config')}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createWorkflow.isPending || updateWorkflow.isPending}
          >
            {(createWorkflow.isPending || updateWorkflow.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Update' : 'Create'} Workflow
          </Button>
        </div>
      </form>
    </div>
  );
}
