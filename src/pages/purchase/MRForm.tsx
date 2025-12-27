import { useState, useEffect, useMemo } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useItems } from '@/lib/hooks/useSite';
import { useApprovedBudgets, useFinalEstimates } from '@/lib/hooks/useEngineering';
import {
  useCreateMR,
  useUpdateMR,
  useSubmitMR,
  useMR,
} from '@/lib/hooks/usePurchaseBackend';
import { ArrowLeft, Plus, Trash2, Send, AlertTriangle, Lock } from 'lucide-react';
import { toast } from 'sonner';

const mrItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  description: z.string().min(1, 'Description is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  uom: z.string().min(1, 'UOM is required'),
  requiredBy: z.string().optional(),
});

const mrSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  budgetId: z.string().min(1, 'Approved Budget is required'),
  estimateId: z.string().min(1, 'Final Estimate is required'),
  items: z.array(mrItemSchema).min(1, 'At least one item is required'),
  remarks: z.string().optional(),
});

type MRFormData = z.infer<typeof mrSchema>;

export default function MRForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data: projects } = useMasterProjects();
  const { data: items } = useItems();
  const { data: mrData } = useMR(id || '');

  const createMR = useCreateMR();
  const updateMR = useUpdateMR();
  const submitMR = useSubmitMR();

  // Local State
  const [mrItems, setMRItems] = useState<MRFormData['items']>([
    { itemId: '', description: '', qty: 1, uom: '', requiredBy: '' },
  ]);

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    register,
  } = useForm<MRFormData>({
    resolver: zodResolver(mrSchema),
    defaultValues: { projectId: '', budgetId: '', estimateId: '', items: mrItems, remarks: '' },
  });

  const selectedProjectId = watch('projectId');
  
  // Fetch approved budgets and final estimates for selected project
  const { data: approvedBudgets = [] } = useApprovedBudgets(selectedProjectId);
  const { data: finalEstimates = [] } = useFinalEstimates(selectedProjectId);

  // Check if MR is locked (SUBMITTED or beyond)
  const isLocked = useMemo(() => {
    if (!mrData) return false;
    const data = mrData.data || mrData;
    return ['SUBMITTED', 'APPROVED', 'REJECTED'].includes(data.status);
  }, [mrData]);

  // Prefill data in edit mode
  useEffect(() => {
    if (mrData && id) {
      const data = mrData.data || mrData;
      const projectId = String(data.projectId?._id || data.projectId || '');
      setValue('projectId', projectId);
      setValue('budgetId', String(data.budgetId || ''));
      setValue('estimateId', String(data.estimateId || ''));
      setValue('remarks', data.remarks || '');

      const formattedItems = (data.items || []).map((item: any) => ({
        itemId: item.itemId?._id || item.itemId || '',
        description: item.description || '',
        qty: item.qty || 1,
        uom: item.uom || '',
        requiredBy: item.requiredBy ? item.requiredBy.split('T')[0] : '',
      }));

      setMRItems(formattedItems);
      setValue('items', formattedItems);
    }
  }, [mrData, id, setValue]);

  // Helpers
  const updateItem = (index: number, field: string, value: any) => {
    if (isLocked) return;
    const updated = [...mrItems];
    updated[index] = { ...updated[index], [field]: value };
    setMRItems(updated);
    setValue('items', updated);
  };

  const addItem = () => {
    if (isLocked) return;
    const newItems = [
      ...mrItems,
      { itemId: '', description: '', qty: 1, uom: '', requiredBy: '' },
    ];
    setMRItems(newItems);
    setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    if (isLocked) return;
    if (mrItems.length > 1) {
      const newItems = mrItems.filter((_, i) => i !== index);
      setMRItems(newItems);
      setValue('items', newItems);
    }
  };

  // Dropdowns
  const projectOptions = (Array.isArray(projects) ? projects : []).map((p: any) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
  }));

  const budgetOptions = (Array.isArray(approvedBudgets) ? approvedBudgets : []).map((b: any) => ({
    value: String(b.id),
    label: `Budget ₹${Number(b.totalBudget).toLocaleString('en-IN')} (APPROVED)`,
  }));

  const estimateOptions = (Array.isArray(finalEstimates) ? finalEstimates : []).map((e: any) => ({
    value: String(e.id),
    label: `${e.name} - ₹${Number(e.baseAmount).toLocaleString('en-IN')} (FINAL)`,
  }));

  const itemOptions = (Array.isArray(items) ? items : []).map((i: any) => ({
    value: i._id || i.id,
    label: `${i.name} (${i.code})`,
  }));

  const uomOptions = [
    { value: 'Nos', label: 'Nos' },
    { value: 'KG', label: 'KG' },
    { value: 'MT', label: 'MT' },
    { value: 'Ltr', label: 'Ltr' },
    { value: 'Sqm', label: 'Sqm' },
    { value: 'Cum', label: 'Cum' },
  ];

  // Submit handler
  const onSubmit = (data: MRFormData, submitType: 'save' | 'submit') => {
    const payload = {
      ...data,
      budgetId: Number(data.budgetId),
      estimateId: Number(data.estimateId),
      projectId: Number(data.projectId),
      items: data.items.map((i) => ({ ...i, qty: Number(i.qty) })),
    };

    if (id) {
      updateMR.mutate(
        { id, data: payload },
        {
          onSuccess: (res: any) => {
            toast.success('MR updated successfully');
            if (submitType === 'submit') {
              handleSubmitForApproval(res.data?._id || id);
            } else navigate('/purchase/mrs');
          },
        }
      );
    } else {
      createMR.mutate(payload, {
        onSuccess: (res: any) => {
          toast.success('MR created successfully');
          if (submitType === 'submit') {
            handleSubmitForApproval(res.data?._id);
          } else navigate('/purchase/mrs');
        },
      });
    }
  };

  // Submit for approval
  const handleSubmitForApproval = (mrId: string) => {
    if (!mrId) return;
    submitMR.mutate(mrId, {
      onSuccess: () => {
        toast.success('MR submitted for approval');
        navigate('/purchase/mrs');
      },
      onError: (err: any) =>
        toast.error(err?.message || 'Failed to submit MR for approval'),
    });
  };

  const hasNoBudget = selectedProjectId && approvedBudgets.length === 0;
  const hasNoEstimate = selectedProjectId && finalEstimates.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/purchase/mrs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {id ? 'Edit' : 'New'} Material Requisition
          </h1>
          <p className="text-muted-foreground">
            {id
              ? 'Update requisition details'
              : 'Create a new material requisition'}
          </p>
        </div>
        {isLocked && (
          <div className="ml-auto flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Locked (Submitted)</span>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit((data) => onSubmit(data, 'save'))}
        className="space-y-6"
      >
        {/* Project & Engineering Info */}
        <Card>
          <CardHeader>
            <CardTitle>Project & Engineering Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Project *</Label>
              <SearchableSelect
                options={projectOptions}
                value={watch('projectId')}
                onChange={(val) => {
                  setValue('projectId', val);
                  setValue('budgetId', '');
                  setValue('estimateId', '');
                }}
                placeholder="Select project"
                disabled={isLocked}
              />
              {errors.projectId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.projectId.message}
                </p>
              )}
            </div>

            {hasNoBudget && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No approved budget found for this project. Budget must be APPROVED before creating MR.
                </AlertDescription>
              </Alert>
            )}

            {hasNoEstimate && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No final estimate found for this project. Estimate must be FINAL before creating MR.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Approved Budget *</Label>
                <SearchableSelect
                  options={budgetOptions}
                  value={watch('budgetId')}
                  onChange={(val) => setValue('budgetId', val)}
                  placeholder="Select approved budget"
                  disabled={isLocked || !selectedProjectId || hasNoBudget}
                  emptyMessage="No approved budget available"
                />
                {errors.budgetId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.budgetId.message}
                  </p>
                )}
              </div>

              <div>
                <Label>Final Estimate *</Label>
                <SearchableSelect
                  options={estimateOptions}
                  value={watch('estimateId')}
                  onChange={(val) => setValue('estimateId', val)}
                  placeholder="Select final estimate"
                  disabled={isLocked || !selectedProjectId || hasNoEstimate}
                  emptyMessage="No final estimate available"
                />
                {errors.estimateId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.estimateId.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Remarks / Purpose</Label>
              <Textarea
                {...register('remarks')}
                placeholder="Add remarks about this requisition"
                disabled={isLocked}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addItem}
                disabled={isLocked}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mrItems.map((item, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {mrItems.length > 1 && !isLocked && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item *</Label>
                    <SearchableSelect
                      options={itemOptions}
                      value={item.itemId}
                      onChange={(val) => updateItem(index, 'itemId', val)}
                      placeholder="Select Item"
                      disabled={isLocked}
                    />
                  </div>

                  <div>
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, 'description', e.target.value)
                      }
                      placeholder="Description"
                      disabled={isLocked}
                    />
                  </div>

                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, 'qty', Number(e.target.value))
                      }
                      placeholder="Quantity"
                      disabled={isLocked}
                    />
                  </div>

                  <div>
                    <Label>UOM *</Label>
                    <SearchableSelect
                      options={uomOptions}
                      value={item.uom}
                      onChange={(val) => updateItem(index, 'uom', val)}
                      placeholder="Select UOM"
                      disabled={isLocked}
                    />
                  </div>

                  <div>
                    <Label>Required By</Label>
                    <Input
                      type="date"
                      value={item.requiredBy}
                      onChange={(e) =>
                        updateItem(index, 'requiredBy', e.target.value)
                      }
                      disabled={isLocked}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/purchase/mrs')}
          >
            Cancel
          </Button>
          {!isLocked && (
            <>
              <Button type="submit" variant="secondary">
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, 'submit'))}
                disabled={hasNoBudget || hasNoEstimate}
              >
                <Send className="h-4 w-4 mr-2" /> Submit for Approval
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}