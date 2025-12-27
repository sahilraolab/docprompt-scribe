import { useEffect, useState, useMemo } from 'react';
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
import {
  useSuppliers,
  useMRs,
  useCreateQuotation,
  useUpdateQuotation,
  useQuotation,
} from '@/lib/hooks/usePurchaseBackend';
import { ArrowLeft, Plus, Trash2, Lock, Calculator } from 'lucide-react';
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

const uomOptions = [
  { value: 'Nos', label: 'Nos' },
  { value: 'KG', label: 'KG' },
  { value: 'MT', label: 'MT' },
  { value: 'Ltr', label: 'Ltr' },
  { value: 'Sqm', label: 'Sqm' },
  { value: 'Cum', label: 'Cum' },
  { value: 'Bag', label: 'Bag' },
  { value: 'Box', label: 'Box' },
];

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

  // Check if quotation is locked (APPROVED or REJECTED)
  const isLocked = useMemo(() => {
    if (!quotationData) return false;
    const q = quotationData.data || quotationData;
    return ['APPROVED', 'REJECTED'].includes(q.status);
  }, [quotationData]);

  useEffect(() => {
    if (quotationData && id) {
      const q = quotationData.data || quotationData;
      setValue('mrId', q.mrId?._id || q.mrId || '');
      setValue('supplierId', q.supplierId?._id || q.supplierId || '');
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
    if (isLocked) return;
    setQuotationItems([
      ...quotationItems,
      { description: '', qty: 1, uom: '', rate: 0, taxPercent: 18 },
    ]);
  };

  const removeItem = (index: number) => {
    if (isLocked) return;
    if (quotationItems.length > 1) {
      setQuotationItems(quotationItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    if (isLocked) return;
    const updated = [...quotationItems];
    updated[index] = { ...updated[index], [field]: value };
    setQuotationItems(updated);
    setValue('items', updated);
  };

  const calculateItemAmount = (item: any) => item.qty * item.rate;
  const calculateItemTax = (item: any) => (calculateItemAmount(item) * (item.taxPercent || 0)) / 100;

  const { subtotal, taxTotal, grandTotal } = useMemo(() => {
    const subtotal = quotationItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
    const taxTotal = quotationItems.reduce((sum, item) => sum + calculateItemTax(item), 0);
    return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
  }, [quotationItems]);

  const onSubmit = (data: QuotationFormData) => {
    const itemsWithAmount = quotationItems.map((item) => ({
      ...item,
      amount: calculateItemAmount(item),
      taxAmount: calculateItemTax(item),
      totalAmount: calculateItemAmount(item) + calculateItemTax(item),
    }));

    const payload = { ...data, items: itemsWithAmount, totalAmount: grandTotal };

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
    .filter((mr: any) => mr.status === 'SUBMITTED' || mr.status === 'APPROVED')
    .map((mr: any) => ({
      value: mr._id || String(mr.id),
      label: `${mr.code || mr.reqNo} (${mr.projectId?.name || 'Project'})`,
    }));

  const supplierList = Array.isArray(suppliersData?.data)
    ? suppliersData.data
    : Array.isArray(suppliersData)
      ? suppliersData
      : [];

  const supplierOptions = supplierList.map((s: any) => ({
    value: s._id || String(s.id),
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
            Supplier quotation for material requisition
          </p>
        </div>
        {isLocked && (
          <div className="ml-auto flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Locked</span>
          </div>
        )}
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
              <SearchableSelect
                options={mrOptions}
                value={mrId}
                onChange={(value) => setValue('mrId', value)}
                placeholder="Select MR"
                disabled={isLocked}
              />
              {errors.mrId && (
                <p className="text-sm text-destructive">{errors.mrId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Supplier *</Label>
                <SearchableSelect
                  options={supplierOptions}
                  value={supplierId}
                  onChange={(value) => setValue('supplierId', value)}
                  placeholder="Select supplier"
                  disabled={isLocked}
                />
                {errors.supplierId && (
                  <p className="text-sm text-destructive">{errors.supplierId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quotation Number *</Label>
                <Input {...register('quotationNo')} placeholder="QT-001" disabled={isLocked} />
                {errors.quotationNo && (
                  <p className="text-sm text-destructive">{errors.quotationNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Quotation Date *</Label>
                <Input type="date" {...register('quotationDate')} disabled={isLocked} />
              </div>

              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" {...register('validUntil')} disabled={isLocked} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Terms</Label>
                <Input {...register('paymentTerms')} placeholder="30 days net" disabled={isLocked} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Terms</Label>
                <Input {...register('deliveryTerms')} placeholder="FOB / CIF" disabled={isLocked} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea {...register('remarks')} placeholder="Additional notes" disabled={isLocked} />
            </div>
          </CardContent>
        </Card>

        {/* ---- Items ---- */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quoted Items</CardTitle>
              {!isLocked && (
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {quotationItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {quotationItems.length > 1 && !isLocked && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
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
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', Number(e.target.value))}
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>UOM *</Label>
                    <SearchableSelect
                      options={uomOptions}
                      value={item.uom}
                      onChange={(val) => updateItem(index, 'uom', val)}
                      placeholder="Select UOM"
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate (₹) *</Label>
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', Number(e.target.value))}
                      disabled={isLocked}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tax %</Label>
                    <Input
                      type="number"
                      value={item.taxPercent}
                      onChange={(e) => updateItem(index, 'taxPercent', Number(e.target.value))}
                      disabled={isLocked}
                    />
                  </div>

                  {/* Auto-calculated Amount */}
                  <div className="col-span-2 bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Amount</span>
                    </div>
                    <span className="font-medium">{formatCurrency(calculateItemAmount(item))}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Totals - Auto-calculated */}
            <div className="border-t pt-4 space-y-2 bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Auto-Calculated Totals</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Total:</span>
                <span className="font-medium">{formatCurrency(taxTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
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
            {isLocked ? 'Back' : 'Cancel'}
          </Button>
          {!isLocked && (
            <Button type="submit">{id ? 'Update' : 'Create'} Quotation</Button>
          )}
        </div>
      </form>
    </div>
  );
}