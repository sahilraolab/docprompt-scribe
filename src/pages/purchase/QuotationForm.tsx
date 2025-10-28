import { useEffect, useState } from 'react';
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
import {
  useSuppliers,
  useMRs,
  useCreateQuotation,
  useUpdateQuotation,
  useQuotation,
} from '@/lib/hooks/usePurchaseBackend';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/format';

const quotationItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  uom: z.string().min(1, 'UOM is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  taxPercent: z.number().min(0).max(100),
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
  const { data: suppliersData } = useSuppliers();
  const { data: mrsData } = useMRs();
  const { data: quotationData } = useQuotation(id || '');

  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();

  const [quotationItems, setQuotationItems] = useState<any[]>([
    { description: '', qty: 1, uom: '', rate: 0, taxPercent: 18 },
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

  useEffect(() => {
    if (quotationData && id) {
      const q = quotationData.data || quotationData;
      setValue('mrId', q.mrId?._id || '');
      setValue('supplierId', q.supplierId?._id || '');
      setValue('quotationNo', q.quotationNo || '');
      setValue('quotationDate', q.quotationDate?.split('T')[0]);
      setValue('validUntil', q.validUntil?.split('T')[0] || '');
      setValue('remarks', q.remarks || '');
      setValue('paymentTerms', q.paymentTerms || '');
      setValue('deliveryTerms', q.deliveryTerms || '');
      setQuotationItems(q.items || []);
    }
  }, [quotationData, id, setValue]);

  useEffect(() => {
    if (quotationItems.length > 0) {
      setValue('items', quotationItems);
    }
  }, [quotationItems, setValue]);


  const mrId = watch('mrId');
  const supplierId = watch('supplierId');

  const addItem = () => {
    setQuotationItems([
      ...quotationItems,
      { description: '', qty: 1, uom: '', rate: 0, taxPercent: 18 },
    ]);
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

  const calculateItemAmount = (item: any) => item.qty * item.rate;
  const calculateTotals = () => {
    const subtotal = quotationItems.reduce(
      (sum, item) => sum + calculateItemAmount(item),
      0
    );
    const taxTotal = quotationItems.reduce(
      (sum, item) =>
        sum + (calculateItemAmount(item) * (item.taxPercent || 0)) / 100,
      0
    );
    return {
      subtotal,
      taxTotal,
      grandTotal: subtotal + taxTotal,
    };
  };
  const { subtotal, taxTotal, grandTotal } = calculateTotals();

  const onSubmit = (data: QuotationFormData) => {
    const itemsWithAmount = quotationItems.map((item) => ({
      ...item,
      amount: calculateItemAmount(item),
    }));

    const payload = { ...data, items: itemsWithAmount };

    if (id) {
      updateQuotation.mutate(
        { id, data: payload },
        {
          onSuccess: () => {
            toast.success('Quotation updated successfully');
            navigate('/purchase/quotations');
          },
          onError: (err: any) =>
            toast.error(err.message || 'Failed to update quotation'),
        }
      );
    } else {
      createQuotation.mutate(payload, {
        onSuccess: () => {
          toast.success('Quotation created successfully');
          navigate('/purchase/quotations');
        },
        onError: (err: any) =>
          toast.error(err.message || 'Failed to create quotation'),
      });
    }
  };

  // ---- Dropdown Data ----
  const mrList = Array.isArray(mrsData?.data)
    ? mrsData.data
    : Array.isArray(mrsData)
      ? mrsData
      : [];

  const mrOptions = mrList
    .filter((mr: any) => mr.status === 'Approved')
    .map((mr: any) => ({
      value: mr._id,
      label: `${mr.code} (${mr.projectId?.name || '-'})`,
    }));

  const supplierList = Array.isArray(suppliersData?.data)
    ? suppliersData.data
    : Array.isArray(suppliersData)
      ? suppliersData
      : [];

  const supplierOptions = supplierList.map((s: any) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/purchase/quotations')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {id ? 'Edit' : 'New'} Quotation
          </h1>
          <p className="text-muted-foreground">
            Supplier quotation for approved material requisition
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ---- Quotation Info ---- */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Material Requisition *</Label>
              <Select
                value={mrId}
                onValueChange={(value) => setValue('mrId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select MR" />
                </SelectTrigger>
                <SelectContent>
                  {mrOptions?.map((mr) => (
                    <SelectItem key={mr.value} value={mr.value}>
                      {mr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mrId && (
                <p className="text-sm text-destructive">
                  {errors.mrId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <Select
                  value={supplierId}
                  onValueChange={(value) => setValue('supplierId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplierOptions?.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.supplierId && (
                  <p className="text-sm text-destructive">
                    {errors.supplierId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quotation Number *</Label>
                <Input {...register('quotationNo')} placeholder="QT-001" />
                {errors.quotationNo && (
                  <p className="text-sm text-destructive">
                    {errors.quotationNo.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quotation Date *</Label>
                <Input type="date" {...register('quotationDate')} />
              </div>

              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" {...register('validUntil')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Input {...register('paymentTerms')} placeholder="30 days net" />
              </div>
              <div className="space-y-2">
                <Label>Delivery Terms</Label>
                <Input {...register('deliveryTerms')} placeholder="FOB / CIF" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea {...register('remarks')} placeholder="Additional notes" />
            </div>
          </CardContent>
        </Card>

        {/* ---- Items ---- */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quoted Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
              >
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {quotationItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
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
                      onChange={(e) =>
                        updateItem(index, 'description', e.target.value)
                      }
                      placeholder="Item description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        updateItem(index, 'qty', Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>UOM *</Label>
                    <Input
                      value={item.uom}
                      onChange={(e) => updateItem(index, 'uom', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate *</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, 'rate', Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tax %</Label>
                    <Input
                      type="number"
                      value={item.taxPercent}
                      onChange={(e) =>
                        updateItem(index, 'taxPercent', Number(e.target.value))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      disabled
                      value={formatCurrency(calculateItemAmount(item))}
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Total:</span>
                <span className="font-medium">
                  {formatCurrency(taxTotal)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---- Actions ---- */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/purchase/quotations')}
          >
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} Quotation</Button>
        </div>
      </form>
    </div>
  );
}
