import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSuppliers } from '@/lib/hooks/usePurchaseBackend';
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

async function fetchItems() {
  const response = await fetch('/api/items');
  if (!response.ok) throw new Error('Failed to fetch items');
  const data = await response.json();
  return data.data;
}

async function fetchRate(id: string) {
  const response = await fetch(`/api/material-rates/${id}`);
  if (!response.ok) throw new Error('Failed to fetch rate');
  return response.json();
}

export default function RateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: suppliers } = useSuppliers();
  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: fetchItems,
  });

  const { data: existingRate, isLoading } = useQuery({
    queryKey: ['material-rates', id],
    queryFn: () => fetchRate(id!),
    enabled: !!id,
  });

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
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/api/material-rates/${id}` : '/api/material-rates';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save rate');

      toast({
        title: id ? 'Rate Updated' : 'Rate Created',
        description: `Material rate has been ${id ? 'updated' : 'created'} successfully.`,
      });
      navigate('/purchase/rates');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save material rate. Please try again.',
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
                <Select
                  value={itemId}
                  onValueChange={(value) => setValue('itemId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items?.map((item: any) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.itemId && (
                  <p className="text-sm text-destructive">{errors.itemId.message}</p>
                )}
              </div>

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
          <Button type="submit">{id ? 'Update' : 'Create'} Rate</Button>
        </div>
      </form>
    </div>
  );
}
