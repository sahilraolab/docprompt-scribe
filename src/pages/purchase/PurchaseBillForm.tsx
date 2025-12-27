import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo } from 'react';
import {
  usePOs,
  useCreatePurchaseBill,
  useUpdatePurchaseBill,
  usePurchaseBill,
} from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Lock, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/format';

// Validation Schema
const billSchema = z.object({
  poId: z.string().min(1, 'Purchase Order is required'),
  invoiceNo: z.string().min(1, 'Invoice Number is required'),
  invoiceDate: z.string().min(1, 'Invoice Date is required'),
  basicAmount: z.string().min(1, 'Basic Amount is required'),
  taxAmount: z.string().min(1, 'Tax Amount is required'),
  remarks: z.string().optional(),
});

type BillFormData = z.infer<typeof billSchema>;

export default function PurchaseBillForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Hooks
  const { data: pos, isLoading: posLoading } = usePOs();
  const { data: billData } = usePurchaseBill(id || '');
  const createBill = useCreatePurchaseBill();
  const updateBill = useUpdatePurchaseBill();

  // Default form values
  const form = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      poId: '',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      basicAmount: '',
      taxAmount: '',
      remarks: '',
    },
  });

  // Check if bill is locked (POSTED status)
  const isLocked = useMemo(() => {
    if (!billData) return false;
    return billData.status === 'POSTED' || billData.postedToAccounts === true;
  }, [billData]);

  // Fill form when editing
  useEffect(() => {
    if (billData && isEdit) {
      form.reset({
        poId: billData.poId?._id || String(billData.poId) || '',
        invoiceNo: billData.billNo || billData.invoiceNo || '',
        invoiceDate: billData.billDate
          ? billData.billDate.split('T')[0]
          : billData.invoiceDate?.split('T')[0] || '',
        basicAmount: String(billData.basicAmount || ''),
        taxAmount: String(billData.taxAmount || ''),
        remarks: billData.remarks || '',
      });
    }
  }, [billData, isEdit, form]);

  // Auto-calculated Total
  const basicAmount = parseFloat(form.watch('basicAmount') || '0');
  const taxAmount = parseFloat(form.watch('taxAmount') || '0');
  const totalAmount = useMemo(() => basicAmount + taxAmount, [basicAmount, taxAmount]);

  // Submit Handler
  const onSubmit = async (data: BillFormData) => {
    try {
      const payload = {
        poId: data.poId,
        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
        basicAmount: parseFloat(data.basicAmount),
        taxAmount: parseFloat(data.taxAmount),
        totalAmount,
        remarks: data.remarks,
      };

      if (isEdit && id) {
        await updateBill.mutateAsync({ id, data: payload });
        toast.success('Purchase Bill updated successfully');
      } else {
        await createBill.mutateAsync(payload);
        toast.success('Purchase Bill created successfully');
      }

      navigate('/purchase/bills');
    } catch (error: any) {
      console.error('Failed to save bill:', error);
      toast.error(error.message || 'Something went wrong');
    }
  };

  // Purchase Orders Dropdown - only approved POs
  const poList = Array.isArray(pos) ? pos : [];
  const poOptions = poList
    .filter((po: any) => po.status === 'APPROVED')
    .map((po: any) => ({
      value: po._id || String(po.id),
      label: `${po.poNo || po.code} - ${po.supplierName || 'Supplier'} (₹${Number(po.totalAmount || 0).toLocaleString('en-IN')})`,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/bills')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Purchase Bill' : 'New Purchase Bill'}
          </h1>
          <p className="text-muted-foreground">
            Record supplier invoice against an approved Purchase Order
          </p>
        </div>
        {isLocked && (
          <div className="ml-auto flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-md">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Locked (Posted to Accounts)</span>
          </div>
        )}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Information</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Purchase Order */}
              <FormField
                control={form.control}
                name="poId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Order (Approved) *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={poOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Approved Purchase Order"
                        disabled={posLoading || isLocked}
                        emptyMessage="No approved PO available"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="INV-001" disabled={isLocked} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLocked} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Amount & Tax */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="basicAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Basic Amount (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="0.00"
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="0.00"
                          disabled={isLocked}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Auto-calculated Total Display */}
              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Auto-Calculated</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Amount (Basic + Tax)</span>
                  <span className="text-xl font-bold">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Remarks */}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter remarks (optional)" disabled={isLocked} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            {!isLocked && (
              <Button type="submit" disabled={createBill.isPending || updateBill.isPending}>
                {isEdit ? 'Update Bill' : 'Create Bill'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => navigate('/purchase/bills')}>
              {isLocked ? 'Back' : 'Cancel'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}