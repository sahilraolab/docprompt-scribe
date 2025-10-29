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
import { useProjects } from '@/lib/hooks/useProjects';
import { useItems, useTransfer, useCreateTransfer, useUpdateTransfer } from '@/lib/hooks/useSite';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SearchableSelect } from '@/components/SearchableSelect';

const transferItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  remarks: z.string().optional(),
});

const transferSchema = z.object({
  fromProjectId: z.string().min(1, 'From project is required'),
  toProjectId: z.string().min(1, 'To project is required'),
  transferDate: z.string().min(1, 'Transfer date is required'),
  vehicleNo: z.string().optional(),
  driverName: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(transferItemSchema).min(1, 'At least one item is required'),
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function TransferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: projects = [] } = useProjects();
  const { data: items = [] } = useItems();
  const { data: existingTransfer, isLoading } = useTransfer(id);
  const { mutateAsync: createTransfer, isPending: isCreating } = useCreateTransfer();
  const { mutateAsync: updateTransfer, isPending: isUpdating } = useUpdateTransfer();
  
  const [transferItems, setTransferItems] = useState<any[]>([
    { itemId: '', qty: 1, remarks: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transferDate: new Date().toISOString().split('T')[0],
    },
  });

  const fromProjectId = watch('fromProjectId');
  const toProjectId = watch('toProjectId');

  // Helper to normalize select values
  const normalizeSelectValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'value' in val) return val.value;
    return String(val);
  };

  // Load existing transfer in edit mode
  useEffect(() => {
    if (existingTransfer && id) {
      setValue('fromProjectId', existingTransfer.fromProjectId?._id || existingTransfer.fromProjectId);
      setValue('toProjectId', existingTransfer.toProjectId?._id || existingTransfer.toProjectId);
      setValue('transferDate', existingTransfer.transferDate?.split('T')[0]);
      setValue('vehicleNo', existingTransfer.vehicleNo);
      setValue('driverName', existingTransfer.driverName);
      setValue('remarks', existingTransfer.remarks);
      if (existingTransfer.items?.length) {
        setTransferItems(existingTransfer.items);
        setValue('items', existingTransfer.items);
      }
    }
  }, [existingTransfer, id, setValue]);

  const addItem = () => {
    setTransferItems([...transferItems, { itemId: '', qty: 1, remarks: '' }]);
  };

  const removeItem = (index: number) => {
    if (transferItems.length > 1) {
      setTransferItems(transferItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...transferItems];
    updated[index] = { ...updated[index], [field]: value };
    setTransferItems(updated);
    setValue('items', updated);
  };

  const onSubmit = async (data: TransferFormData) => {
    if (data.fromProjectId === data.toProjectId) {
      toast({
        title: 'Error',
        description: 'From and To projects cannot be the same.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (id) {
        await updateTransfer({ id, data });
        toast({ title: 'Transfer Updated', description: 'Material transfer updated successfully' });
      } else {
        await createTransfer(data);
        toast({ title: 'Transfer Created', description: 'Material transfer created successfully' });
      }
      navigate('/site/transfers');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save transfer',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/site/transfers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Material Transfer</h1>
          <p className="text-muted-foreground">Transfer materials between projects</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromProjectId">From Project *</Label>
                <SearchableSelect
                  options={projects.map((project: any) => ({
                    value: project._id,
                    label: `${project.name} (${project.code})`,
                  }))}
                  value={normalizeSelectValue(fromProjectId)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('fromProjectId', value);
                  }}
                  placeholder="Search source project..."
                />
                {errors.fromProjectId && (
                  <p className="text-sm text-destructive">{errors.fromProjectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="toProjectId">To Project *</Label>
                <SearchableSelect
                  options={projects.map((project: any) => ({
                    value: project._id,
                    label: `${project.name} (${project.code})`,
                  }))}
                  value={normalizeSelectValue(toProjectId)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('toProjectId', value);
                  }}
                  placeholder="Search destination project..."
                />
                {errors.toProjectId && (
                  <p className="text-sm text-destructive">{errors.toProjectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferDate">Transfer Date *</Label>
                <Input type="date" {...register('transferDate')} />
                {errors.transferDate && (
                  <p className="text-sm text-destructive">{errors.transferDate.message}</p>
                )}
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
                placeholder="Reason for transfer, conditions, etc."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items to Transfer</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {transferItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {transferItems.length > 1 && (
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
                  <div className="space-y-2">
                    <Label>Item *</Label>
                    <SearchableSelect
                      options={items.map((item: any) => ({
                        value: item._id,
                        label: `${item.name} (${item.code})`,
                      }))}
                      value={normalizeSelectValue(item.itemId)}
                      onChange={(raw) => {
                        const value = normalizeSelectValue(raw);
                        updateItem(index, 'itemId', value);
                      }}
                      placeholder="Search and select item..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Item Remarks</Label>
                    <Input
                      value={item.remarks}
                      onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                      placeholder="Optional notes for this item"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/site/transfers')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {id ? 'Update' : 'Create'} Transfer
          </Button>
        </div>
      </form>
    </div>
  );
}
