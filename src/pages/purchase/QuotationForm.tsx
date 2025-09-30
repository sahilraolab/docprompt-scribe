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
import { useSuppliers } from '@/lib/hooks/usePurchase';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';

const quotationItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  uom: z.string().min(1, 'UOM is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  taxPct: z.number().min(0).max(100),
});

const quotationSchema = z.object({
  mrId: z.string().min(1, 'Material requisition is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  quotationNo: z.string().min(1, 'Quotation number is required'),
  quotationDate: z.string().min(1, 'Quotation date is required'),
  validUntil: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryTerms: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
});

type QuotationFormData = z.infer<typeof quotationSchema>;

export default function QuotationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: suppliers } = useSuppliers();
  
  const [quotationItems, setQuotationItems] = useState<any[]>([
    { description: '', qty: 1, uom: '', rate: 0, taxPct: 18 },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      quotationDate: new Date().toISOString().split('T')[0],
    },
  });

  const mrId = watch('mrId');
  const supplierId = watch('supplierId');

  const addItem = () => {
    setQuotationItems([...quotationItems, { description: '', qty: 1, uom: '', rate: 0, taxPct: 18 }]);
  };

  const removeItem = (index: number) => {
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...quotationItems];
    updated[index] = { ...updated[index], [field]: value };
    setQuotationItems(updated);
    setValue('items', updated);
  };

  const calculateItemAmount = (item: any) => {
    return item.qty * item.rate;
  };

  const calculateTotals = () => {
    const subtotal = quotationItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
    const taxTotal = quotationItems.reduce(
      (sum, item) => sum + (calculateItemAmount(item) * item.taxPct) / 100,
      0
    );
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  };

  const { subtotal, taxTotal, grandTotal } = calculateTotals();

  const onSubmit = (data: QuotationFormData) => {
    console.log('Quotation Data:', { ...data, subtotal, taxTotal, grandTotal });
    toast({
      title: id ? 'Quotation Updated' : 'Quotation Created',
      description: `Quotation has been ${id ? 'updated' : 'created'} successfully.`,
    });
    navigate('/purchase/quotations');
  };

  // Mock MRs
  const materialRequisitions = [
    { id: '1', code: 'MR-2024-001', project: 'Green Valley Apartments' },
    { id: '2', code: 'MR-2024-002', project: 'Tech Park Complex' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/quotations')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Quotation</h1>
          <p className="text-muted-foreground">Supplier quotation for material requisition</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Quotation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mrId">Material Requisition *</Label>
              <Select
                value={mrId}
                onValueChange={(value) => setValue('mrId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select MR" />
                </SelectTrigger>
                <SelectContent>
                  {materialRequisitions.map((mr) => (
                    <SelectItem key={mr.id} value={mr.id}>
                      {mr.code} - {mr.project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mrId && (
                <p className="text-sm text-destructive">{errors.mrId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier *</Label>
                <Select
                  value={supplierId}
                  onValueChange={(value) => setValue('supplierId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supplierId && (
                  <p className="text-sm text-destructive">{errors.supplierId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotationNo">Quotation Number *</Label>
                <Input {...register('quotationNo')} placeholder="QT-001" />
                {errors.quotationNo && (
                  <p className="text-sm text-destructive">{errors.quotationNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotationDate">Quotation Date *</Label>
                <Input type="date" {...register('quotationDate')} />
                {errors.quotationDate && (
                  <p className="text-sm text-destructive">{errors.quotationDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">Valid Until</Label>
                <Input type="date" {...register('validUntil')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  {...register('paymentTerms')}
                  placeholder="e.g., 30 days net"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryTerms">Delivery Terms</Label>
                <Input
                  {...register('deliveryTerms')}
                  placeholder="e.g., FOB, CIF"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                {...register('remarks')}
                placeholder="Additional notes or conditions"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quoted Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {quotationItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {quotationItems.length > 1 && (
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
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
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
                    <Label>UOM *</Label>
                    <Input
                      value={item.uom}
                      onChange={(e) => updateItem(index, 'uom', e.target.value)}
                      placeholder="Unit"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate *</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tax %</Label>
                    <Input
                      type="number"
                      value={item.taxPct}
                      onChange={(e) => updateItem(index, 'taxPct', parseFloat(e.target.value))}
                      min="0"
                      max="100"
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
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Total:</span>
                <span className="font-medium">{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchase/quotations')}>
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} Quotation</Button>
        </div>
      </form>
    </div>
  );
}
