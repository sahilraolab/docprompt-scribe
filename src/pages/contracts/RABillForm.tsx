import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';
import { SearchableSelect } from '@/components/SearchableSelect';
import {
  useWorkOrders,
  useRABill,
  useCreateRABill,
  useUpdateRABill,
  useWorkOrderItems,
} from '@/lib/hooks/useContracts';

// --------------------------
// 🧾 Validation Schema
// --------------------------
const raBillItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  unit: z.string().min(1, 'Unit is required'),
  agreedQty: z.number().min(0),
  prevQty: z.number().min(0),
  currentQty: z.number().min(0),
  rate: z.number().min(0),
});

const raBillSchema = z.object({
  workOrderId: z.string().min(1, 'Work order is required'),
  billNo: z.string().min(1, 'Bill number is required'),
  billDate: z.string().min(1, 'Bill date is required'),
  fromDate: z.string().min(1, 'From date is required'),
  toDate: z.string().min(1, 'To date is required'),
  retentionPct: z.number().min(0).max(100),
  remarks: z.string().optional(),
  items: z.array(raBillItemSchema).min(1, 'At least one work item is required'),
});

type RABillFormData = z.infer<typeof raBillSchema>;

// --------------------------
// 🏗️ Component
// --------------------------
export default function RABillForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: workOrdersData = [], isLoading: workOrdersLoading } = useWorkOrders();
  const { data: existingRABill, isLoading: billLoading } = useRABill(id);
  const { mutateAsync: createRABill, isPending: isCreating } = useCreateRABill();
  const { mutateAsync: updateRABill, isPending: isUpdating } = useUpdateRABill();

  const [raBillItems, setRaBillItems] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RABillFormData>({
    resolver: zodResolver(raBillSchema),
    defaultValues: {
      retentionPct: 5,
      billDate: new Date().toISOString().split('T')[0],
      items: [],
    },
  });

  const workOrderId = watch('workOrderId');
  const retentionPct = watch('retentionPct') || 0;

  // Fetch work order items when WO changes
  const { data: workOrderItems = [], isLoading: itemsLoading } = useWorkOrderItems(workOrderId);

  // Helper to normalize select values
  const normalizeSelectValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'value' in val) return val.value;
    return String(val);
  };

  // --------------------------
  // 📦 Load Existing Bill (Edit Mode)
  // --------------------------
  useEffect(() => {
    if (existingRABill && id) {
      reset({
        workOrderId: existingRABill.workOrderId?._id || '',
        billNo: existingRABill.billNo,
        billDate: existingRABill.billDate?.split('T')[0],
        fromDate: existingRABill.fromDate?.split('T')[0],
        toDate: existingRABill.toDate?.split('T')[0],
        retentionPct: existingRABill.retentionPct || 5,
        remarks: existingRABill.remarks || '',
        items: existingRABill.items || [],
      });
      setRaBillItems(existingRABill.items || []);
    }
  }, [existingRABill, id, reset]);

  // --------------------------
  // 🔄 Load Work Order Items on Selection
  // --------------------------
  useEffect(() => {
  if (workOrderItems?.length) {
    // 🧹 Normalize items from backend into UI-friendly structure
    const normalizedItems = workOrderItems.map((i: any) => ({
      itemId: i.itemId?._id || i._id,
      description: i.description || i.itemId?.description || '',
      unit: i.itemId?.uom || i.unit || '',
      agreedQty: i.qty || 0,
      prevQty: i.prevQty || 0,
      currentQty: 0,
      rate: i.rate || 0,
      amount: (i.qty || 0) * (i.rate || 0),
      progress: i.progress || 0,
    }));

    console.log('✅ Normalized Work Order Items:', normalizedItems);
    setRaBillItems(normalizedItems);
    setValue('items', normalizedItems);
  } else {
    console.log('⚠️ No work order items found');
    setRaBillItems([]);
    setValue('items', []);
  }
}, [workOrderItems, setValue]);


  // --------------------------
  // 🧮 Calculations
  // --------------------------
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...raBillItems];
    updated[index] = { ...updated[index], [field]: value };
    setRaBillItems(updated);
    setValue('items', updated);
  };

  const calculateItemAmount = (item: any) => item.currentQty * item.rate;

  const calculateTotals = () => {
    const gross = raBillItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
    const retention = (gross * retentionPct) / 100;
    const net = gross - retention;
    return { gross, retention, net };
  };

  const { gross, retention, net } = calculateTotals();

  // --------------------------
  // 💾 Submit Handler
  // --------------------------
  const onSubmit = async (data: RABillFormData) => {
    try {
      const payload = { ...data, gross, retention, net };
      if (id) {
        await updateRABill({ id, payload });
        toast({ title: 'RA Bill Updated', description: 'The bill has been successfully updated.' });
      } else {
        await createRABill(payload);
        toast({ title: 'RA Bill Created', description: 'The bill has been successfully created.' });
      }
      navigate('/contracts/ra-bills');
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong while saving the RA Bill.',
        variant: 'destructive',
      });
    }
  };

  if (billLoading || workOrdersLoading) {
    return <p className="text-center text-muted-foreground">Loading data...</p>;
  }

  // --------------------------
  // 🖥️ JSX
  // --------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/ra-bills')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} RA Bill</h1>
          <p className="text-muted-foreground">Running Account Bill for progress payment</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Bill Information */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Work Order Select */}
            <div className="space-y-2">
              <Label htmlFor="workOrderId">Work Order *</Label>
              <SearchableSelect
                options={workOrdersData.map((wo: any) => ({
                  value: wo._id,
                  label: `${wo.code} - ${wo.contractorId?.name || 'Unknown'} (${wo.projectId?.name || 'Unknown Project'})`,
                }))}
                value={normalizeSelectValue(workOrderId)}
                onChange={(raw) => {
                  const value = normalizeSelectValue(raw);
                  setValue('workOrderId', value);
                  setRaBillItems([]); // clear items when work order changes
                }}
                placeholder="Search and select work order..."
              />
              {errors.workOrderId && (
                <p className="text-sm text-destructive">{errors.workOrderId.message}</p>
              )}
            </div>

            {/* Bill Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bill Number *</Label>
                <Input {...register('billNo')} placeholder="RA-001" />
                {errors.billNo && <p className="text-sm text-destructive">{errors.billNo.message}</p>}
              </div>

              <div>
                <Label>Bill Date *</Label>
                <Input type="date" {...register('billDate')} />
                {errors.billDate && <p className="text-sm text-destructive">{errors.billDate.message}</p>}
              </div>

              <div>
                <Label>Work Period From *</Label>
                <Input type="date" {...register('fromDate')} />
                {errors.fromDate && <p className="text-sm text-destructive">{errors.fromDate.message}</p>}
              </div>

              <div>
                <Label>Work Period To *</Label>
                <Input type="date" {...register('toDate')} />
                {errors.toDate && <p className="text-sm text-destructive">{errors.toDate.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Work Items Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {itemsLoading ? (
  <p className="text-sm text-muted-foreground">Loading work items...</p>
) : raBillItems.length === 0 ? (
  <p className="text-muted-foreground text-sm">
    Select a Work Order to load its items.
  </p>
) : (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="text-left p-2 text-sm font-medium">Description</th>
          <th className="text-left p-2 text-sm font-medium">Unit</th>
          <th className="text-right p-2 text-sm font-medium">Agreed Qty</th>
          <th className="text-right p-2 text-sm font-medium">Prev. Done</th>
          <th className="text-right p-2 text-sm font-medium">Current Qty</th>
          <th className="text-right p-2 text-sm font-medium">Rate</th>
          <th className="text-right p-2 text-sm font-medium">Amount</th>
        </tr>
      </thead>
      <tbody>
        {raBillItems.map((item, index) => (
          <tr key={index} className="border-b">
            <td className="p-2 text-sm">{item.description}</td>
            <td className="p-2 text-sm">{item.unit || '—'}</td>
            <td className="p-2 text-sm text-right">{item.agreedQty}</td>
            <td className="p-2 text-sm text-right">{item.prevQty}</td>
            <td className="p-2">
              <Input
                type="number"
                value={item.currentQty}
                onChange={(e) =>
                  updateItem(index, 'currentQty', parseFloat(e.target.value) || 0)
                }
                className="w-24 text-right"
                min="0"
                max={item.agreedQty - item.prevQty}
              />
            </td>
            <td className="p-2 text-sm text-right">
              {formatCurrency(item.rate, 'full')}
            </td>
            <td className="p-2 text-sm text-right font-medium">
              {formatCurrency(calculateItemAmount(item))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


            {/* Totals */}
            {raBillItems.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Gross Amount:</span>
                  <span className="font-semibold">{formatCurrency(gross)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="retentionPct" className="text-sm">
                      Retention %:
                    </Label>
                    <Input
                      type="number"
                      {...register('retentionPct', { valueAsNumber: true })}
                      className="w-20 text-right"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <span className="font-semibold text-amber-600">
                    -{formatCurrency(retention)}
                  </span>
                </div>

                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Net Payable:</span>
                  <span className="text-green-600">{formatCurrency(net)}</span>
                </div>
              </div>
            )}

            {/* Remarks */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                {...register('remarks')}
                placeholder="Additional notes or observations"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/contracts/ra-bills')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {id ? 'Update' : 'Create'} RA Bill
          </Button>
        </div>
      </form>
    </div>
  );
}
