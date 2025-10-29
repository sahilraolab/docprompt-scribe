import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/PageHeader';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { SearchableSelect } from '@/components/SearchableSelect';
import { toast } from 'sonner';
import { useInvestment, useCreateInvestment, useUpdateInvestment } from '@/lib/hooks/usePartners';
import { useProjects } from '@/lib/hooks/useProjects';
import { usePartners } from '@/lib/hooks/usePartners';

const investmentSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  partnerId: z.string().min(1, 'Partner is required'),
  sharePercent: z.number().min(0).max(100),
  preferredReturnPercent: z.number().min(0).default(0),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

type InvestmentFormData = z.infer<typeof investmentSchema>;

interface Contribution {
  id: string;
  date: string;
  amount: number;
  reference: string;
}

export default function ProjectInvestmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [contributions, setContributions] = useState<Contribution[]>([
    { id: '1', date: '2024-01-15', amount: 5000000, reference: 'Initial Capital' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      projectId: 'PRJ-00001',
      partnerId: 'PAR-00001',
      sharePercent: 25,
      preferredReturnPercent: 12,
      notes: '',
      active: true,
    },
  });

  const mockProjects = [
    { value: 'PRJ-00001', label: 'PRJ-00001 - Luxury Villa Project' },
    { value: 'PRJ-00002', label: 'PRJ-00002 - Commercial Complex' },
    { value: 'PRJ-00003', label: 'PRJ-00003 - Residential Tower' },
  ];

  const mockPartners = [
    { value: 'PAR-00001', label: 'PAR-00001 - Raj Kumar' },
    { value: 'PAR-00002', label: 'PAR-00002 - Shanti Developers Pvt Ltd' },
    { value: 'PAR-00003', label: 'PAR-00003 - Priya Investments' },
  ];

  const onSubmit = (data: InvestmentFormData) => {
    console.log({ ...data, contributions });
    toast.success(isEdit ? 'Investment updated successfully' : 'Investment created successfully');
    navigate('/partners/investments');
  };

  const addContribution = () => {
    const newContribution: Contribution = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      reference: '',
    };
    setContributions([...contributions, newContribution]);
  };

  const removeContribution = (id: string) => {
    setContributions(contributions.filter((c) => c.id !== id));
  };

  const updateContribution = (id: string, field: keyof Contribution, value: any) => {
    setContributions(
      contributions.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Project Investment' : 'New Project Investment'}
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/partners/investments'),
            icon: ArrowLeft,
            variant: 'outline',
          },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
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
                <Label htmlFor="partnerId">Partner *</Label>
                <SearchableSelect
                  options={mockPartners}
                  value={watch('partnerId')}
                  onChange={(value) => setValue('partnerId', value)}
                  placeholder="Select partner"
                />
                {errors.partnerId && (
                  <p className="text-sm text-destructive">{errors.partnerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sharePercent">Share Percentage *</Label>
                <Input
                  id="sharePercent"
                  type="number"
                  step="0.01"
                  {...register('sharePercent', { valueAsNumber: true })}
                />
                {errors.sharePercent && (
                  <p className="text-sm text-destructive">{errors.sharePercent.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferredReturnPercent">Preferred Return % (p.a.)</Label>
                <Input
                  id="preferredReturnPercent"
                  type="number"
                  step="0.01"
                  {...register('preferredReturnPercent', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Capital Contributions</CardTitle>
            <Button type="button" onClick={addContribution} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Contribution
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <div key={contribution.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={contribution.date}
                      onChange={(e) => updateContribution(contribution.id, 'date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={contribution.amount}
                      onChange={(e) =>
                        updateContribution(contribution.id, 'amount', parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reference</Label>
                    <Input
                      value={contribution.reference}
                      onChange={(e) => updateContribution(contribution.id, 'reference', e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeContribution(contribution.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {contributions.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No contributions added yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/partners/investments')}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Update' : 'Create'} Investment
          </Button>
        </div>
      </form>
    </div>
  );
}
