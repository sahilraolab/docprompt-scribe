import { useState, useEffect } from 'react';
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
}).refine((data) => {
  if (!data.deliveryDate) return true;
  const today = new Date().toISOString().split('T')[0];
  return data.deliveryDate >= today;
}, {
  message: 'Delivery date must be today or in the future',
  path: ['deliveryDate'],
}).refine((data) => {
  const total = data.items.reduce((sum, item) => sum + (item.qty * item.rate * (1 + item.taxPct / 100)), 0);
  return total <= 100000000;
}, {
  message: 'PO amount exceeds ₹10 Cr threshold, approval required',
  path: ['items'],
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
  
  const [poItems, setPoItems] = useState<POFormData['items']>([
    { description: '', qty: 1, uom: '', rate: 0, taxPct: 18 },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: { items: poItems, projectId: '', supplierId: '', deliveryDate: '', terms: '' },
  });

  const selectedProjectId = watch('projectId');
  const selectedSupplierId = watch('supplierId');

  useEffect(() => {
    if (poData && id) {
      setValue('projectId', poData.projectId || '');
      setValue('supplierId', poData.supplierId || '');
      setValue('deliveryDate', poData.deliveryDate ? poData.deliveryDate.split('T')[0] : '');
      setValue('terms', poData.terms || '');
      const formattedItems = poData.items?.map((item: any) => ({
        description: item.description || '',
        qty: item.qty || 0,
        uom: item.uom || '',
        rate: item.rate || 0,
        taxPct: item.taxPct || 0,
      })) || [];
      setPoItems(formattedItems);
      setValue('items', formattedItems);
    }
  }, [poData, id, setValue]);

  const addItem = () => {
    const newItems = [...poItems, { description: '', qty: 1, uom: '', rate: 0, taxPct: 18 }];
    setPoItems(newItems);
    setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    if (poItems.length > 1) {
      const newItems = poItems.filter((_, i) => i !== index);
      setPoItems(newItems);
      setValue('items', newItems);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...poItems];
    updated[index] = { ...updated[index], [field]: value };
    setPoItems(updated);
    setValue('items', updated);
  };

  const calculateItemAmount = (item: any) => {
    return item.qty * item.rate;
  };

  const calculateTotals = () => {
    const subtotal = poItems.reduce((sum, item) => sum + calculateItemAmount(item), 0);
    const taxTotal = poItems.reduce(
      (sum, item) => sum + (calculateItemAmount(item) * item.taxPct) / 100,
      0
    );
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  };

  const { subtotal, taxTotal, grandTotal } = calculateTotals();

  const projectOptions = (Array.isArray(projects) ? projects : []).map(project => ({
    value: project.id,
    label: `${project.name} (${project.code})`,
  }));

  const supplierOptions = (Array.isArray(suppliers) ? suppliers : []).map(supplier => ({
    value: supplier.id,
    label: `${supplier.name} (${supplier.code})`,
  }));

  const onSubmit = (data: POFormData) => {
    const poData = { ...data, total: subtotal, taxTotal, grandTotal };
    if (id) {
      updatePO.mutate({ id, data: poData as any }, {
        onSuccess: () => {
          toast.success('PO updated successfully');
          navigate('/purchase/pos');
        },
      });
    } else {
      createPO.mutate(poData as any, {
        onSuccess: () => {
          toast.success('PO created successfully');
          navigate('/purchase/pos');
        },
      });
    }
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
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <SearchableSelect
                  options={projectOptions}
                  value={selectedProjectId}
                  onChange={(value) => setValue('projectId', value)}
                  placeholder="Select project"
                  searchPlaceholder="Search projects..."
                  disabled={projectsLoading}
                />
                {errors.projectId && (
                  <p className="text-sm text-destructive">{errors.projectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier *</Label>
                <SearchableSelect
                  options={supplierOptions}
                  value={selectedSupplierId}
                  onChange={(value) => setValue('supplierId', value)}
                  placeholder="Select supplier"
                  searchPlaceholder="Search suppliers..."
                  disabled={suppliersLoading}
                />
                {errors.supplierId && (
                  <p className="text-sm text-destructive">{errors.supplierId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Delivery Date</Label>
                <Input type="date" {...register('deliveryDate')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                {...register('terms')}
                placeholder="Enter payment and delivery terms"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>PO Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {poItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {poItems.length > 1 && (
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
                  <div className="space-y-2 col-span-2">
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
                      placeholder="e.g., kg, pcs, m"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rate (₹) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tax % *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.taxPct}
                      onChange={(e) => updateItem(index, 'taxPct', parseFloat(e.target.value))}
                      min="0"
                      max="100"
                    />
                  </div>

                  <div className="col-span-2 p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Item Amount:</span>
                      <span className="font-medium">{formatCurrency(calculateItemAmount(item))}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax Total:</span>
                <span>₹{taxTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchase/pos')}>
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} PO</Button>
        </div>
      </form>
    </div>
  );
}
