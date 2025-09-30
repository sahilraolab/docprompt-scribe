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
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useItems } from '@/lib/hooks/useSite';

const grnItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  orderedQty: z.number().min(0),
  receivedQty: z.number().min(1, 'Received quantity must be at least 1'),
  acceptedQty: z.number().min(0),
  rejectedQty: z.number().min(0),
  remarks: z.string().optional(),
});

const grnSchema = z.object({
  poId: z.string().min(1, 'Purchase order is required'),
  grnDate: z.string().min(1, 'GRN date is required'),
  invoiceNo: z.string().optional(),
  vehicleNo: z.string().optional(),
  driverName: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(grnItemSchema).min(1, 'At least one item is required'),
}).refine((data) => {
  // Business rule: GRN date cannot be in the future
  const today = new Date().toISOString().split('T')[0];
  return data.grnDate <= today;
}, {
  message: 'GRN date cannot be in the future',
  path: ['grnDate'],
}).refine((data) => {
  // Business rule: Accepted + Rejected must equal Received
  return data.items.every(item => 
    Math.abs((item.acceptedQty + item.rejectedQty) - item.receivedQty) < 0.01
  );
}, {
  message: 'Accepted + Rejected quantities must equal Received quantity for all items',
  path: ['items'],
});

type GRNFormData = z.infer<typeof grnSchema>;

export default function GRNForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: items } = useItems();
  
  const [grnItems, setGrnItems] = useState<any[]>([
    { itemId: '', orderedQty: 0, receivedQty: 0, acceptedQty: 0, rejectedQty: 0, remarks: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      grnDate: new Date().toISOString().split('T')[0],
    },
  });

  const poId = watch('poId');

  const addItem = () => {
    setGrnItems([...grnItems, { itemId: '', orderedQty: 0, receivedQty: 0, acceptedQty: 0, rejectedQty: 0, remarks: '' }]);
  };

  const removeItem = (index: number) => {
    if (grnItems.length > 1) {
      setGrnItems(grnItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...grnItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate accepted/rejected
    if (field === 'receivedQty' || field === 'acceptedQty' || field === 'rejectedQty') {
      const receivedQty = field === 'receivedQty' ? parseFloat(value) : updated[index].receivedQty;
      const acceptedQty = field === 'acceptedQty' ? parseFloat(value) : updated[index].acceptedQty;
      const rejectedQty = field === 'rejectedQty' ? parseFloat(value) : updated[index].rejectedQty;
      
      if (field === 'receivedQty') {
        updated[index].acceptedQty = receivedQty;
        updated[index].rejectedQty = 0;
      } else if (field === 'acceptedQty') {
        updated[index].rejectedQty = Math.max(0, receivedQty - acceptedQty);
      } else if (field === 'rejectedQty') {
        updated[index].acceptedQty = Math.max(0, receivedQty - rejectedQty);
      }
    }
    
    setGrnItems(updated);
    setValue('items', updated);
  };

  const onSubmit = (data: GRNFormData) => {
    console.log('GRN Data:', data);
    toast({
      title: id ? 'GRN Updated' : 'GRN Created',
      description: `Goods Receipt Note has been ${id ? 'updated' : 'created'} successfully.`,
    });
    navigate('/site/grn');
  };

  // Mock POs
  const purchaseOrders = [
    { id: '1', code: 'PO-2024-001', supplier: 'ABC Suppliers' },
    { id: '2', code: 'PO-2024-002', supplier: 'XYZ Trading' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/site/grn')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} GRN</h1>
          <p className="text-muted-foreground">Goods Receipt Note for material receiving</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GRN Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poId">Purchase Order *</Label>
              <Select
                value={poId}
                onValueChange={(value) => setValue('poId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select purchase order" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseOrders.map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.code} - {po.supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.poId && (
                <p className="text-sm text-destructive">{errors.poId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grnDate">GRN Date *</Label>
                <Input type="date" {...register('grnDate')} />
                {errors.grnDate && (
                  <p className="text-sm text-destructive">{errors.grnDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Supplier Invoice No</Label>
                <Input {...register('invoiceNo')} placeholder="INV-12345" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNo">Vehicle Number</Label>
                <Input {...register('vehicleNo')} placeholder="MH-01-AB-1234" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input {...register('driverName')} placeholder="Driver name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">General Remarks</Label>
              <Textarea
                {...register('remarks')}
                placeholder="Any general observations"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Received Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {grnItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {grnItems.length > 1 && (
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

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 space-y-2">
                    <Label>Item *</Label>
                    <Select
                      value={item.itemId}
                      onValueChange={(value) => updateItem(index, 'itemId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {items?.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} ({item.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Ordered Qty</Label>
                    <Input
                      type="number"
                      value={item.orderedQty}
                      onChange={(e) => updateItem(index, 'orderedQty', parseFloat(e.target.value) || 0)}
                      className="bg-muted"
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Received Qty *</Label>
                    <Input
                      type="number"
                      value={item.receivedQty}
                      onChange={(e) => updateItem(index, 'receivedQty', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Accepted Qty</Label>
                    <Input
                      type="number"
                      value={item.acceptedQty}
                      onChange={(e) => updateItem(index, 'acceptedQty', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="border-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rejected Qty</Label>
                    <Input
                      type="number"
                      value={item.rejectedQty}
                      onChange={(e) => updateItem(index, 'rejectedQty', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="border-red-500"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Item Remarks</Label>
                    <Input
                      value={item.remarks}
                      onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                      placeholder="Quality issues, damage, etc."
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/site/grn')}>
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} GRN</Button>
        </div>
      </form>
    </div>
  );
}
