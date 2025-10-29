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
import { SearchableSelect } from '@/components/SearchableSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// ✅ Validation Schema
const billSchema = z.object({
  poId: z.string().min(1, 'Purchase Order is required'),
  invoiceNo: z.string().min(1, 'Invoice Number is required'),
  invoiceDate: z.string().min(1, 'Invoice Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  taxPct: z.string().min(1, 'Tax percentage is required'),
  status: z.enum(['Draft', 'Pending', 'Approved', 'Paid']),
  remarks: z.string().optional(),
});

type BillFormData = z.infer<typeof billSchema>;

export default function PurchaseBillForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  // 🔹 Hooks
  const { data: pos, isLoading: posLoading } = usePOs();
  const { data: billData } = usePurchaseBill(id || '');
  const createBill = useCreatePurchaseBill();
  const updateBill = useUpdatePurchaseBill();

  // 🔹 Default form values
  const form = useForm<BillFormData>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      poId: '',
      invoiceNo: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      amount: '',
      taxPct: '18',
      status: 'Draft',
      remarks: '',
    },
  });

  // 🔹 Fill form when editing
  useEffect(() => {
    if (billData && isEdit) {
      form.reset({
        poId: billData.poId?._id || billData.poId || '',
        invoiceNo: billData.invoiceNo || '',
        invoiceDate: billData.invoiceDate
          ? billData.invoiceDate.split('T')[0]
          : '',
        amount: String(billData.amount || ''),
        taxPct: '18',
        status: billData.status || 'Draft',
        remarks: billData.remarks || '',
      });
    }
  }, [billData, isEdit, form]);

  // 🔹 Computed Values
  const amount = parseFloat(form.watch('amount') || '0');
  const taxPct = parseFloat(form.watch('taxPct') || '0');
  const tax = useMemo(() => (amount * taxPct) / 100, [amount, taxPct]);
  const total = useMemo(() => amount + tax, [amount, tax]);

  // 🔹 Submit Handler
  const onSubmit = async (data: BillFormData) => {
    try {
      const payload = {
        poId: data.poId,
        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
        amount: parseFloat(data.amount),
        tax,
        total,
        status: data.status,
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

  // 🔹 Purchase Orders Dropdown
  const poOptions = (pos || []).map((po: any) => ({
    value: po._id,
    label: `${po.code} - ${po.supplierName || 'Supplier'}`,
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
            Record supplier invoice against a Purchase Order
          </p>
        </div>
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
                    <FormLabel>Purchase Order *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={poOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select Purchase Order"
                        disabled={posLoading}
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
                        <Input {...field} placeholder="INV-001" />
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
                        <Input type="date" {...field} />
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxPct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Percentage (%) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          placeholder="18"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Totals Display */}
              <div className="grid grid-cols-3 gap-4 bg-muted p-4 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">Tax Amount</div>
                  <div className="text-lg font-semibold">
                    ₹{tax.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-lg font-semibold">
                    ₹{total.toLocaleString('en-IN')}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Remarks */}
              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter remarks (optional)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" disabled={createBill.isPending || updateBill.isPending}>
              {isEdit ? 'Update Bill' : 'Create Bill'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/purchase/bills')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
