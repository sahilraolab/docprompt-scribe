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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjects } from '@/lib/hooks/useProjects';
import { useContractors } from '@/lib/hooks/useContracts';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';

const workItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  unit: z.string().min(1, 'Unit is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  rate: z.number().min(0, 'Rate must be positive'),
});

const workOrderSchema = z.object({
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
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

export default function WorkOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: projects } = useProjects();
  const { data: contractors } = useContractors();
  
  const [workItems, setWorkItems] = useState<any[]>([
    { description: '', unit: '', qty: 1, rate: 0 },
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
    },
  });

  const selectedProjectId = watch('projectId');
  const selectedContractorId = watch('contractorId');
  const advancePct = watch('advancePct') || 0;

  const addItem = () => {
    setWorkItems([...workItems, { description: '', unit: '', qty: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (workItems.length > 1) {
      setWorkItems(workItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...workItems];
    updated[index] = { ...updated[index], [field]: value };
    setWorkItems(updated);
    setValue('items', updated);
  };

  const calculateItemAmount = (item: any) => {
    return item.qty * item.rate;
  };

  const calculateTotals = () => {
    const total = workItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
    const advance = (total * advancePct) / 100;
    return { total, advance };
  };

  const { total, advance } = calculateTotals();

  const onSubmit = (data: WorkOrderFormData) => {
    console.log('Work Order Data:', { ...data, total, advance });
    toast({
      title: id ? 'Work Order Updated' : 'Work Order Created',
      description: `Work order has been ${id ? 'updated' : 'created'} successfully.`,
    });
    navigate('/contracts/work-orders');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/work-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Work Order</h1>
          <p className="text-muted-foreground">
            {id ? 'Update work order details' : 'Create a new work order'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select
                  value={selectedProjectId}
                  onValueChange={(value) => setValue('projectId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name} ({project.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.projectId && (
                  <p className="text-sm text-destructive">{errors.projectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractorId">Contractor *</Label>
                <Select
                  value={selectedContractorId}
                  onValueChange={(value) => setValue('contractorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {contractors?.map((contractor) => (
                      <SelectItem key={contractor.id} value={contractor.id}>
                        {contractor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contractorId && (
                  <p className="text-sm text-destructive">{errors.contractorId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input type="date" {...register('startDate')} />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input type="date" {...register('endDate')} />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="workDescription">Work Description *</Label>
              <Textarea
                {...register('workDescription')}
                placeholder="Brief description of the work"
                rows={2}
              />
              {errors.workDescription && (
                <p className="text-sm text-destructive">{errors.workDescription.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="scopeOfWork">Scope of Work *</Label>
              <Textarea
                {...register('scopeOfWork')}
                placeholder="Detailed scope of work (one item per line)"
                rows={4}
              />
              {errors.scopeOfWork && (
                <p className="text-sm text-destructive">{errors.scopeOfWork.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Work Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {workItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {workItems.length > 1 && (
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
                  <div className="col-span-2 space-y-2">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Work item description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit *</Label>
                    <Input
                      value={item.unit}
                      onChange={(e) => updateItem(index, 'unit', e.target.value)}
                      placeholder="e.g., SQM, CUM, Point"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value))}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate (₹) *</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      value={formatCurrency(calculateItemAmount(item))}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Contract Value:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advancePct">Advance Payment %</Label>
                <Input
                  type="number"
                  {...register('advancePct', { valueAsNumber: true })}
                  min="0"
                  max="100"
                />
                <p className="text-sm text-muted-foreground">
                  Advance Amount: {formatCurrency(advance)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Textarea
                {...register('paymentTerms')}
                placeholder="Payment schedule and conditions"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="penaltyClause">Penalty Clause</Label>
              <Textarea
                {...register('penaltyClause')}
                placeholder="Penalty for delay or non-performance"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/contracts/work-orders')}>
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} Work Order</Button>
        </div>
      </form>
    </div>
  );
}
