import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLabourRate, useCreateLabourRate, useUpdateLabourRate } from '@/lib/hooks/useContracts';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';

const labourRateSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  dailyRate: z.number().min(0, 'Daily rate must be positive'),
  hourlyRate: z.number().min(0).optional(),
  overtimeRate: z.number().min(0).optional(),
  effectiveFrom: z.string().min(1, 'Effective from date is required'),
  effectiveTo: z.string().optional(),
});

type LabourRateFormData = z.infer<typeof labourRateSchema>;

export default function LabourRatesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: existingRate, isLoading } = useLabourRate(id);
  const { mutateAsync: createRate, isPending: isCreating } = useCreateLabourRate();
  const { mutateAsync: updateRate, isPending: isUpdating } = useUpdateLabourRate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LabourRateFormData>({
    resolver: zodResolver(labourRateSchema),
    defaultValues: {
      hourlyRate: 0,
      overtimeRate: 0,
    },
  });

  const category = watch('category');
  const location = watch('location');

  // Helper to normalize select values
  const normalizeSelectValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'value' in val) return val.value;
    return String(val);
  };

  useEffect(() => {
    if (existingRate && id) {
      reset({
        category: existingRate.category,
        location: existingRate.location,
        dailyRate: existingRate.dailyRate,
        hourlyRate: existingRate.hourlyRate,
        overtimeRate: existingRate.overtimeRate,
        effectiveFrom: existingRate.effectiveFrom?.split('T')[0],
        effectiveTo: existingRate.effectiveTo?.split('T')[0],
      });
    }
  }, [existingRate, id, reset]);

  const onSubmit = async (data: LabourRateFormData) => {
    try {
      if (id) {
        await updateRate({ id, payload: data });
        toast({ title: 'Labour Rate Updated', description: 'Labour rate updated successfully' });
      } else {
        await createRate(data);
        toast({ title: 'Labour Rate Created', description: 'Labour rate created successfully' });
      }
      navigate('/contracts/labour-rates');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save labour rate',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/labour-rates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Labour Rate</h1>
          <p className="text-muted-foreground">Define labour category rates</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Rate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Labour Category *</Label>
                <SearchableSelect
                  options={[
                    { value: 'skilled', label: 'Skilled Labour' },
                    { value: 'semiskilled', label: 'Semi-Skilled Labour' },
                    { value: 'unskilled', label: 'Unskilled Labour' },
                    { value: 'mason', label: 'Mason' },
                    { value: 'carpenter', label: 'Carpenter' },
                    { value: 'welder', label: 'Welder' },
                    { value: 'electrician', label: 'Electrician' },
                    { value: 'plumber', label: 'Plumber' },
                  ]}
                  value={normalizeSelectValue(category)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('category', value);
                  }}
                  placeholder="Select labour category..."
                />
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <SearchableSelect
                  options={[
                    { value: 'mumbai', label: 'Mumbai' },
                    { value: 'delhi', label: 'Delhi' },
                    { value: 'bangalore', label: 'Bangalore' },
                    { value: 'pune', label: 'Pune' },
                    { value: 'hyderabad', label: 'Hyderabad' },
                    { value: 'chennai', label: 'Chennai' },
                    { value: 'kolkata', label: 'Kolkata' },
                  ]}
                  value={normalizeSelectValue(location)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('location', value);
                  }}
                  placeholder="Select location..."
                />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
                <Input type="number" {...register('dailyRate', { valueAsNumber: true })} placeholder="Enter daily rate" />
                {errors.dailyRate && <p className="text-sm text-destructive">{errors.dailyRate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                <Input type="number" {...register('hourlyRate', { valueAsNumber: true })} placeholder="Enter hourly rate" />
                {errors.hourlyRate && <p className="text-sm text-destructive">{errors.hourlyRate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtimeRate">Overtime Rate (₹)</Label>
                <Input type="number" {...register('overtimeRate', { valueAsNumber: true })} placeholder="Enter overtime rate" />
                {errors.overtimeRate && <p className="text-sm text-destructive">{errors.overtimeRate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From *</Label>
                <Input type="date" {...register('effectiveFrom')} />
                {errors.effectiveFrom && <p className="text-sm text-destructive">{errors.effectiveFrom.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveTo">Effective To</Label>
                <Input type="date" {...register('effectiveTo')} />
                {errors.effectiveTo && <p className="text-sm text-destructive">{errors.effectiveTo.message}</p>}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id ? 'Update Rate' : 'Create Rate'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/contracts/labour-rates')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
