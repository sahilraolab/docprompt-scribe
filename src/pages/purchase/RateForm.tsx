import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  useSuppliers, 
  useItems, 
  useMaterialRate, 
  useCreateMaterialRate, 
  useUpdateMaterialRate 
} from '@/lib/hooks/usePurchaseBackend';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

const rateSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  supplierId: z.string().min(1, 'Supplier is required'),
  rate: z.number().min(0, 'Rate must be positive'),
  uom: z.string().min(1, 'UOM is required'),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  effectiveTo: z.string().optional(),
  isActive: z.boolean().default(true),
});

type RateFormData = z.infer<typeof rateSchema>;

export default function RateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: suppliers, isLoading: suppliersLoading } = useSuppliers();
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: existingRate, isLoading: rateLoading } = useMaterialRate(id || '');
  
  const createMutation = useCreateMaterialRate();
  const updateMutation = useUpdateMaterialRate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RateFormData>({
    resolver: zodResolver(rateSchema),
    defaultValues: {
      effectiveFrom: new Date().toISOString().split('T')[0],
      isActive: true,
    },
  });

  const itemId = watch('itemId');
  const supplierId = watch('supplierId');
  const isActive = watch('isActive');

  useEffect(() => {
    if (existingRate) {
      reset({
        itemId: existingRate.itemId,
        supplierId: existingRate.supplierId,
        rate: existingRate.rate,
        uom: existingRate.uom,
        effectiveFrom: existingRate.effectiveFrom,
        effectiveTo: existingRate.effectiveTo || '',
        isActive: existingRate.isActive,
      });
    }
  }, [existingRate, reset]);

  const onSubmit = async (data: RateFormData) => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/purchase/rates');
    } catch (error) {
      // Error toast is handled by the mutation hooks
    }
  };

  const isLoading = suppliersLoading || itemsLoading || (id && rateLoading);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const itemOptions = (Array.isArray(items) ? items : []).map(item => ({
    value: item.id,
    label: `${item.name} (${item.code})`,
  }));

  const supplierOptions = (Array.isArray(suppliers) ? suppliers : []).map(supplier => ({
    value: supplier.id,
    label: `${supplier.name} (${supplier.code})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/rates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Material Rate</h1>
          <p className="text-muted-foreground">Manage supplier material rates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemId">Item *</Label>
                <SearchableSelect
                  options={itemOptions}
                  value={itemId}
                  onChange={(value) => setValue('itemId', value)}
                  placeholder="Search items..."
                />
                {errors.itemId && (
                  <p className="text-sm text-destructive">{errors.itemId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplierId">Supplier *</Label>
                <SearchableSelect
                  options={supplierOptions}
                  value={supplierId}
                  onChange={(value) => setValue('supplierId', value)}
                  placeholder="Search suppliers..."
                />
                {errors.supplierId && (
                  <p className="text-sm text-destructive">{errors.supplierId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Rate *</Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('rate', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.rate && (
                  <p className="text-sm text-destructive">{errors.rate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="uom">Unit of Measure *</Label>
                <Input
                  {...register('uom')}
                  placeholder="e.g., kg, m, pcs"
                />
                {errors.uom && (
                  <p className="text-sm text-destructive">{errors.uom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From *</Label>
                <Input type="date" {...register('effectiveFrom')} />
                {errors.effectiveFrom && (
                  <p className="text-sm text-destructive">{errors.effectiveFrom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveTo">Effective To</Label>
                <Input type="date" {...register('effectiveTo')} />
                <p className="text-xs text-muted-foreground">Leave blank for current rate</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active Rate
              </Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchase/rates')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {id ? 'Update' : 'Create'} Rate
          </Button>
        </div>
      </form>
    </div>
  );
}
