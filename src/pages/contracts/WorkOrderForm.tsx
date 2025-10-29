import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';
import { useProjects } from '@/lib/hooks/useProjects';
import { useContractors, useCreateWorkOrder, useUpdateWorkOrder, useWorkOrder } from '@/lib/hooks/useContracts';
import { useItems } from '@/lib/hooks/useSite';
import { SearchableSelect } from '@/components/SearchableSelect';

// ----------------------
// UOM Options (Static)
// ----------------------
const UOM_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'mg', label: 'Milligram (mg)' },
  { value: 'ltr', label: 'Litre (ltr)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'm', label: 'Meter (m)' },
  { value: 'cm', label: 'Centimeter (cm)' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
  { value: 'set', label: 'Set' },
];

// ----------------------
// Validation Schemas
// ----------------------
const workItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  description: z.string().min(1, 'Description is required'),
  unit: z.string().min(1, 'Unit is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be positive'),
});

const workOrderSchema = z
  .object({
    projectId: z.string().min(1, 'Project is required'),
    contractorId: z.string().min(1, 'Contractor is required'),
    workDescription: z.string().min(1, 'Work description is required'),
    scopeOfWork: z.string().min(1, 'Scope of work is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    advancePct: z.number().min(0).max(100),
    paymentTerms: z.string().optional(),
    penaltyClause: z.string().optional(),
    items: z.array(workItemSchema).min(1, 'At least one work item is required'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

// ----------------------
// Component
// ----------------------
export default function WorkOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: projects = [] } = useProjects();
  const { data: contractors = [] } = useContractors();
  const { data: itemsList = [] } = useItems();
  const { data: existingWO } = useWorkOrder(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workItems, setWorkItems] = useState<any[]>([
    { itemId: '', description: '', unit: '', qty: 1, rate: 0 },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      advancePct: 10,
      paymentTerms: '70% on completion, 20% on milestones, 10% advance',
      penaltyClause: '0.5% per day for delay beyond 15 days',
      items: workItems,
    },
  });

  const selectedProjectId = watch('projectId');
  const selectedContractorId = watch('contractorId');
  const advancePct = watch('advancePct') || 0;

  // Helper: normalize incoming select value (handles string or option object)
  const normalizeSelectValue = (incoming: any) => {
    if (incoming === null || incoming === undefined) return '';
    if (typeof incoming === 'string') return incoming;
    if (typeof incoming === 'object' && 'value' in incoming) return incoming.value;
    return String(incoming);
  };

  // ----------------------
  // Helper functions
  // ----------------------
  const addItem = () => {
    const updated = [...workItems, { itemId: '', description: '', unit: '', qty: 1, rate: 0 }];
    setWorkItems(updated);
    setValue('items', updated);
  };

  const removeItem = (index: number) => {
    if (workItems.length > 1) {
      const updated = workItems.filter((_, i) => i !== index);
      setWorkItems(updated);
      setValue('items', updated);
    }
  };

  // Immutable update helper — updates a single item at index with given partial
  const updateItem = (index: number, patch: Partial<any>) => {
    const updated = workItems.map((it, i) => (i === index ? { ...it, ...patch } : it));
    setWorkItems(updated);
    setValue('items', updated);
  };

  const calculateItemAmount = (item: any) => (Number(item.qty) || 0) * (Number(item.rate) || 0);

  const total = workItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  const advance = (total * advancePct) / 100;

  // ----------------------
  // Form Submit
  // ----------------------
  const { mutateAsync: createWorkOrder } = useCreateWorkOrder();
  const { mutateAsync: updateWorkOrder } = useUpdateWorkOrder();

  const onSubmit = async (data: WorkOrderFormData) => {
    try {
      setIsSubmitting(true);
      const payload = { ...data, amount: total, woDate: new Date().toISOString() };

      if (id) {
        await updateWorkOrder({ id, payload });
        toast({ title: 'Work Order Updated', description: 'Work order updated successfully' });
      } else {
        await createWorkOrder(payload);
        toast({ title: 'Work Order Created', description: 'Work order created successfully' });
      }

      navigate('/contracts/work-orders');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save work order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------
  // JSX
  // ----------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/work-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Work Order</h1>
          <p className="text-muted-foreground">{id ? 'Update work order details' : 'Create a new work order'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project & Contractor */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <SearchableSelect
                  options={projects.map((p) => ({ value: p._id, label: `${p.name} (${p.code})` }))}
                  value={normalizeSelectValue(selectedProjectId)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('projectId', value);
                  }}
                  placeholder="Search and select project..."
                />
                {errors.projectId && <p className="text-sm text-destructive">{errors.projectId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Contractor *</Label>
                <SearchableSelect
                  options={contractors.map((c) => ({ value: c._id, label: c.name }))}
                  value={normalizeSelectValue(selectedContractorId)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('contractorId', value);
                  }}
                  placeholder="Search and select contractor..."
                />
                {errors.contractorId && <p className="text-sm text-destructive">{errors.contractorId.message}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input type="date" {...register('endDate')} />
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Description *</Label>
              <Textarea {...register('workDescription')} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Scope of Work *</Label>
              <Textarea {...register('scopeOfWork')} rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Work Items */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Work Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {workItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {workItems.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                {/* Item Selection */}
                <div className="space-y-2">
                  <Label>Select Item *</Label>
                  <SearchableSelect
                    options={itemsList.map((itm) => ({ value: itm._id, label: `${itm.name} (${itm.uom || 'N/A'})` }))}
                    value={normalizeSelectValue(item.itemId)}
                    onChange={(raw) => {
                      const value = normalizeSelectValue(raw);
                      // find the selected item by id
                      const selected = itemsList.find((i) => String(i._id) === String(value));
                      if (selected) {
                        // ensure unit uses same casing as UOM_OPTIONS values (lowercase)
                        const normalizedUom = selected.uom ? String(selected.uom).toLowerCase() : '';
                        updateItem(index, {
                          itemId: selected._id,
                          description: selected.description || selected.name,
                          unit: normalizedUom,
                          rate: selected.defaultRate ?? 0,
                        });
                      } else {
                        // if user cleared selection
                        updateItem(index, { itemId: '', description: '', unit: '', rate: 0 });
                      }
                    }}
                    placeholder="Search and select item..."
                  />
                </div>

                {/* UOM Dropdown */}
                <div className="space-y-2">
                  <Label>Unit of Measure *</Label>
                  <SearchableSelect
                    options={UOM_OPTIONS}
                    value={normalizeSelectValue(item.unit)}
                    onChange={(raw) => {
                      const value = normalizeSelectValue(raw);
                      updateItem(index, { unit: value });
                    }}
                    placeholder="Select UOM..."
                  />
                </div>

                {/* Quantity, Rate, Amount */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, { qty: Number(e.target.value || 0) })}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rate (₹)</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, { rate: Number(e.target.value || 0) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input value={formatCurrency(calculateItemAmount(item))} disabled />
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 flex justify-between text-lg font-semibold">
              <span>Total Contract Value:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Advance Payment %</Label>
                <Input type="number" {...register('advancePct', { valueAsNumber: true })} min="0" max="100" />
                <p className="text-sm text-muted-foreground">Advance Amount: {formatCurrency(advance)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Textarea {...register('paymentTerms')} rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Penalty Clause</Label>
              <Textarea {...register('penaltyClause')} rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/contracts/work-orders')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : id ? 'Update' : 'Create'} Work Order</Button>
        </div>
      </form>
    </div>
  );
}
