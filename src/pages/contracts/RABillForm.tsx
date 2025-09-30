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
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';

const raBillItemSchema = z.object({
  description: z.string().min(1),
  unit: z.string().min(1),
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
  items: z.array(raBillItemSchema).min(1),
});

type RABillFormData = z.infer<typeof raBillSchema>;

export default function RABillForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [raBillItems, setRaBillItems] = useState<any[]>([
    { description: 'Foundation work', unit: 'SQM', agreedQty: 500, prevQty: 500, currentQty: 0, rate: 2500 },
    { description: 'RCC Structure', unit: 'CUM', agreedQty: 800, prevQty: 600, currentQty: 0, rate: 6500 },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RABillFormData>({
    resolver: zodResolver(raBillSchema),
    defaultValues: {
      retentionPct: 5,
      billDate: new Date().toISOString().split('T')[0],
    },
  });

  const workOrderId = watch('workOrderId');
  const retentionPct = watch('retentionPct') || 0;

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...raBillItems];
    updated[index] = { ...updated[index], [field]: value };
    setRaBillItems(updated);
    setValue('items', updated);
  };

  const calculateItemAmount = (item: any) => {
    return item.currentQty * item.rate;
  };

  const calculateTotals = () => {
    const gross = raBillItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
    const retention = (gross * retentionPct) / 100;
    const net = gross - retention;
    return { gross, retention, net };
  };

  const { gross, retention, net } = calculateTotals();

  const onSubmit = (data: RABillFormData) => {
    console.log('RA Bill Data:', { ...data, gross, retention, net });
    toast({
      title: id ? 'RA Bill Updated' : 'RA Bill Created',
      description: `Running Account Bill has been ${id ? 'updated' : 'created'} successfully.`,
    });
    navigate('/contracts/ra-bills');
  };

  // Mock work orders
  const workOrders = [
    { id: '1', code: 'WO-2024-001', contractor: 'BuildPro Contractors' },
    { id: '2', code: 'WO-2024-002', contractor: 'MetroCon Builders' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/ra-bills')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} RA Bill</h1>
          <p className="text-muted-foreground">Running Account Bill for progress payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bill Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workOrderId">Work Order *</Label>
              <Select
                value={workOrderId}
                onValueChange={(value) => setValue('workOrderId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work order" />
                </SelectTrigger>
                <SelectContent>
                  {workOrders.map((wo) => (
                    <SelectItem key={wo.id} value={wo.id}>
                      {wo.code} - {wo.contractor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.workOrderId && (
                <p className="text-sm text-destructive">{errors.workOrderId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billNo">Bill Number *</Label>
                <Input {...register('billNo')} placeholder="RA-001" />
                {errors.billNo && (
                  <p className="text-sm text-destructive">{errors.billNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billDate">Bill Date *</Label>
                <Input type="date" {...register('billDate')} />
                {errors.billDate && (
                  <p className="text-sm text-destructive">{errors.billDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fromDate">Work Period From *</Label>
                <Input type="date" {...register('fromDate')} />
                {errors.fromDate && (
                  <p className="text-sm text-destructive">{errors.fromDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="toDate">Work Period To *</Label>
                <Input type="date" {...register('toDate')} />
                {errors.toDate && (
                  <p className="text-sm text-destructive">{errors.toDate.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Work Items Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      <td className="p-2 text-sm">{item.unit}</td>
                      <td className="p-2 text-sm text-right">{item.agreedQty}</td>
                      <td className="p-2 text-sm text-right">{item.prevQty}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={item.currentQty}
                          onChange={(e) => updateItem(index, 'currentQty', parseFloat(e.target.value) || 0)}
                          className="w-24 text-right"
                          min="0"
                          max={item.agreedQty - item.prevQty}
                        />
                      </td>
                      <td className="p-2 text-sm text-right">{formatCurrency(item.rate, 'full')}</td>
                      <td className="p-2 text-sm text-right font-medium">
                        {formatCurrency(calculateItemAmount(item))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Gross Amount:</span>
                <span className="font-semibold">{formatCurrency(gross)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label htmlFor="retentionPct" className="text-sm">Retention %:</Label>
                  <Input
                    type="number"
                    {...register('retentionPct', { valueAsNumber: true })}
                    className="w-20"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <span className="font-semibold text-amber-600">-{formatCurrency(retention)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Net Payable:</span>
                <span className="text-green-600">{formatCurrency(net)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                {...register('remarks')}
                placeholder="Additional notes or observations"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/contracts/ra-bills')}>
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} RA Bill</Button>
        </div>
      </form>
    </div>
  );
}
