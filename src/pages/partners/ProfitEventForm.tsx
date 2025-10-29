import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/PageHeader';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { toast } from 'sonner';
import { useProfitEvent, useCreateProfitEvent, useUpdateProfitEvent } from '@/lib/hooks/usePartners';
import { useProjects } from '@/lib/hooks/useProjects';

const profitEventSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  periodFrom: z.string().min(1, 'Period from is required'),
  periodTo: z.string().min(1, 'Period to is required'),
  profitAmount: z.number(),
  note: z.string().optional(),
  status: z.enum(['Draft', 'Approved', 'Distributed']).default('Draft'),
});

type ProfitEventFormData = z.infer<typeof profitEventSchema>;

export default function ProfitEventForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfitEventFormData>({
    resolver: zodResolver(profitEventSchema),
    defaultValues: {
      projectId: 'PRJ-00001',
      periodFrom: '2024-01-01',
      periodTo: '2024-03-31',
      profitAmount: 2500000,
      note: '',
      status: 'Draft',
    },
  });

  const mockProjects = [
    { value: 'PRJ-00001', label: 'PRJ-00001 - Luxury Villa Project' },
    { value: 'PRJ-00002', label: 'PRJ-00002 - Commercial Complex' },
    { value: 'PRJ-00003', label: 'PRJ-00003 - Residential Tower' },
  ];

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Distributed', label: 'Distributed' },
  ];

  const onSubmit = (data: ProfitEventFormData) => {
    console.log(data);
    toast.success(isEdit ? 'Profit event updated successfully' : 'Profit event created successfully');
    navigate('/partners/profit-events');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Profit Event' : 'New Profit Event'}
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/partners/profit-events'),
            icon: ArrowLeft,
            variant: 'outline',
          },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profit Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <SearchableSelect
                  options={mockProjects}
                  value={watch('projectId')}
                  onChange={(value) => setValue('projectId', value)}
                  placeholder="Select project"
                />
                {errors.projectId && (
                  <p className="text-sm text-destructive">{errors.projectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <SearchableSelect
                  options={statusOptions}
                  value={watch('status')}
                  onChange={(value) => setValue('status', value as any)}
                  placeholder="Select status"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodFrom">Period From *</Label>
                <Input id="periodFrom" type="date" {...register('periodFrom')} />
                {errors.periodFrom && (
                  <p className="text-sm text-destructive">{errors.periodFrom.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodTo">Period To *</Label>
                <Input id="periodTo" type="date" {...register('periodTo')} />
                {errors.periodTo && (
                  <p className="text-sm text-destructive">{errors.periodTo.message}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="profitAmount">Profit/Loss Amount *</Label>
                <Input
                  id="profitAmount"
                  type="number"
                  step="0.01"
                  {...register('profitAmount', { valueAsNumber: true })}
                  placeholder="Enter positive for profit, negative for loss"
                />
                {errors.profitAmount && (
                  <p className="text-sm text-destructive">{errors.profitAmount.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Notes</Label>
              <Textarea id="note" {...register('note')} rows={4} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/partners/profit-events')}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Update' : 'Create'} Event
          </Button>
        </div>
      </form>
    </div>
  );
}
