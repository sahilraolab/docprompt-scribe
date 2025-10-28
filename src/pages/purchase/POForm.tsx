import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useProjects } from '@/lib/hooks/useProjects';
import { useSuppliers, useCreatePO, useUpdatePO, usePO } from '@/lib/hooks/usePurchaseBackend';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/format';

const poItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  uom: z.string().min(1, 'UOM is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  taxPct: z.number().min(0).max(100),
});

const poSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  deliveryDate: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
});

type POFormData = z.infer<typeof poSchema>;

export default function POForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: poData } = usePO(id || '');

  const createPO = useCreatePO();
  const updatePO = useUpdatePO();

  const uoms = [
    'Nos', 'Kgs', 'MT', 'Ltr', 'Sqm', 'Cum', 'Bag', 'Box',
    'Bundle', 'Roll', 'Feet', 'Meter', 'Hour', 'Day',
  ];

  const [poItems, setPoItems] = useState<POFormData['items']>([
    { description: '', qty: 1, uom: '', rate: 0, taxPct: 18 },
  ]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      projectId: '',
      supplierId: '',
      deliveryDate: '',
      terms: '',
      items: poItems,
    },
  });

  // ✅ Load existing PO (Edit mode)
  useEffect(() => {
    if (poData && id) {
      const formattedItems =
        poData.items?.map((item: any) => ({
          description: item.description || '',
          qty: item.qty || 1,
          uom: item.uom || '',
          rate: item.rate || 0,
          taxPct: item.taxPercent || 18,
        })) || [];

      setPoItems(formattedItems);
      reset({
        projectId: poData.projectId?._id || poData.projectId || '',
        supplierId: poData.supplierId?._id || poData.supplierId || '',
        deliveryDate: poData.deliveryDate
          ? poData.deliveryDate.split('T')[0]
          : '',
        terms: poData.terms || '',
        items: formattedItems,
      });
    }
  }, [poData, id, reset]);

  // ✅ Item operations
  const addItem = () => {
    const newItems = [...poItems, { description: '', qty: 1, uom: '', rate: 0, taxPct: 18 }];
    setPoItems(newItems);
    setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    const newItems = poItems.filter((_, i) => i !== index);
    setPoItems(newItems);
    setValue('items', newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    updated[index] = { ...updated[index], [field]: value };
    setPoItems(updated);
    setValue('items', updated);
  };

  // ✅ Totals
  const calcAmount = (item: any) => (item.qty * item.rate) || 0;
  const subtotal = poItems.reduce((s, i) => s + calcAmount(i), 0);
  const taxAmount = poItems.reduce((s, i) => s + (calcAmount(i) * i.taxPct) / 100, 0);
  const grandTotal = subtotal + taxAmount;

  // ✅ Select options
  const projectOptions = (Array.isArray(projects) ? projects : []).map((p: any) => ({
    value: p._id,
    label: `${p.name} (${p.code})`,
  }));

  const supplierOptions = (Array.isArray(suppliers) ? suppliers : []).map((s: any) => ({
    value: s._id,
    label: `${s.name} (${s.code})`,
  }));

  const uomOptions = uoms.map((u) => ({ value: u, label: u }));

  // ✅ inside onSubmit (replace your existing function)
  const onSubmit = (data: POFormData) => {
    const itemsWithAmounts = poItems.map((item) => ({
      description: item.description,
      qty: item.qty,
      uom: item.uom,
      rate: item.rate,
      taxPercent: item.taxPct, // ✅ renamed for backend
      amount: item.qty * item.rate, // ✅ required by backend
    }));

    const poPayload = {
      ...data,
      poDate: new Date(), // ✅ required by backend
      items: itemsWithAmounts,
      subtotal,
      taxAmount,
      totalAmount: grandTotal,
    };

    const mutation = id ? updatePO : createPO;
    mutation.mutate(
      id ? { id, data: poPayload as any } : (poPayload as any),
      {
        onSuccess: () => {
          toast.success(`PO ${id ? 'updated' : 'created'} successfully`);
          navigate('/purchase/pos');
        },
      }
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/pos')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Purchase Order</h1>
          <p className="text-muted-foreground">
            {id ? 'Update purchase order details' : 'Create a new purchase order'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ✅ Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Project *</Label>
                <Controller
                  control={control}
                  name="projectId"
                  render={({ field }) => (
                    <SearchableSelect
                      options={projectOptions}
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      placeholder="Select project"
                      searchPlaceholder="Search projects..."
                      disabled={projectsLoading}
                    />
                  )}
                />
                {errors.projectId && <p className="text-sm text-destructive">{errors.projectId.message}</p>}
              </div>

              <div>
                <Label>Supplier *</Label>
                <Controller
                  control={control}
                  name="supplierId"
                  render={({ field }) => (
                    <SearchableSelect
                      options={supplierOptions}
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      placeholder="Select supplier"
                      searchPlaceholder="Search suppliers..."
                      disabled={suppliersLoading}
                    />
                  )}
                />
                {errors.supplierId && <p className="text-sm text-destructive">{errors.supplierId.message}</p>}
              </div>

              <div>
                <Label>Delivery Date</Label>
                <Input type="date" {...register('deliveryDate')} />
              </div>
            </div>

            <div>
              <Label>Terms & Conditions</Label>
              <Textarea {...register('terms')} rows={3} placeholder="Enter payment and delivery terms" />
            </div>
          </CardContent>
        </Card>

        {/* ✅ Items Section */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>PO Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {poItems.map((item, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Item {i + 1}</h4>
                  {poItems.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(i, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>

                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(i, 'qty', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label>UOM *</Label>
                    <SearchableSelect
                      options={uomOptions}
                      value={item.uom}
                      onChange={(v) => updateItem(i, 'uom', v)}
                      placeholder="Select UOM"
                      searchPlaceholder="Search UOM..."
                    />
                  </div>

                  <div>
                    <Label>Rate (₹) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(i, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <Label>Tax % *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.taxPct}
                      onChange={(e) => updateItem(i, 'taxPct', parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="col-span-2 bg-muted rounded-lg p-3 flex justify-between text-sm">
                    <span>Item Amount:</span>
                    <span className="font-medium">{formatCurrency(calcAmount(item))}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ✅ Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span>Tax:</span><span>₹{taxAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between font-bold border-t pt-2 text-lg"><span>Grand Total:</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate('/purchase/pos')}>Cancel</Button>
          <Button type="submit">{id ? 'Update' : 'Create'} PO</Button>
        </div>
      </form>
    </div>
  );
}
