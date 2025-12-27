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
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';
import { useAccounts, useJournal, useCreateJournal, useUpdateJournal } from '@/lib/hooks/useAccounts';
import { useProjects } from '@/lib/hooks/useProjects';

const journalEntrySchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  debit: z.number().min(0),
  credit: z.number().min(0),
  narration: z.string().optional(),
});

const journalSchema = z.object({
  date: z.string().min(1, 'Journal date is required'),
  code: z.string().optional(),
  type: z.enum(['General', 'Payment', 'Receipt', 'Contra', 'Journal']),
  narration: z.string().min(1, 'Description is required'),
  projectId: z.string().optional(),
  entries: z.array(journalEntrySchema).min(2, 'At least two entries are required'),
});

type JournalFormData = z.infer<typeof journalSchema>;

export default function JournalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  
  const { data: accounts } = useAccounts();
  const { data: projects } = useProjects();
  const { data: journal, isLoading: isLoadingJournal } = useJournal(id);
  const createJournal = useCreateJournal();
  const updateJournal = useUpdateJournal();

  const [journalEntries, setJournalEntries] = useState<any[]>([
    { accountId: '', debit: 0, credit: 0, narration: '' },
    { accountId: '', debit: 0, credit: 0, narration: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'General',
      narration: '',
      projectId: '',
    },
  });

  useEffect(() => {
    if (journal && isEdit) {
      setValue('date', journal.date);
      setValue('code', journal.code);
      setValue('type', journal.type);
      setValue('narration', journal.narration || '');
      setValue('projectId', journal.projectId || '');
      if (journal.entries) {
        setJournalEntries(journal.entries.map(e => ({
          accountId: e.accountId,
          debit: e.debit,
          credit: e.credit,
          narration: e.narration || '',
        })));
      }
    }
  }, [journal, isEdit, setValue]);

  const addEntry = () => {
    setJournalEntries([...journalEntries, { accountId: '', debit: 0, credit: 0, narration: '' }]);
  };

  const removeEntry = (index: number) => {
    if (journalEntries.length > 2) {
      setJournalEntries(journalEntries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const updated = [...journalEntries];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'debit' && parseFloat(value) > 0) {
      updated[index].credit = 0;
    } else if (field === 'credit' && parseFloat(value) > 0) {
      updated[index].debit = 0;
    }
    
    setJournalEntries(updated);
    setValue('entries', updated);
  };

  const calculateTotals = () => {
    const totalDebit = journalEntries.reduce((sum, entry) => sum + (parseFloat(entry.debit) || 0), 0);
    const totalCredit = journalEntries.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0);
    const difference = totalDebit - totalCredit;
    const isBalanced = Math.abs(difference) < 0.01;
    return { totalDebit, totalCredit, difference, isBalanced };
  };

  const { totalDebit, totalCredit, difference, isBalanced } = calculateTotals();

  const onSubmit = async (data: JournalFormData) => {
    if (!isBalanced) {
      toast({
        title: 'Error',
        description: 'Journal entries must balance. Debit and Credit totals must be equal.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const journalData = {
        date: data.date,
        code: data.code,
        type: data.type,
        narration: data.narration,
        projectId: data.projectId || undefined,
        entries: journalEntries.map((e, idx) => ({
          id: `temp-${idx}`, // Temporary ID for new entries
          accountId: e.accountId,
          debit: parseFloat(e.debit) || 0,
          credit: parseFloat(e.credit) || 0,
          narration: e.narration,
        })),
        totalDebit,
        totalCredit,
        status: 'Draft' as const,
      };

      if (isEdit && id) {
        await updateJournal.mutateAsync({ id, data: journalData });
      } else {
        await createJournal.mutateAsync(journalData);
      }
      navigate('/accounts/journals');
    } catch (error) {
      console.error('Failed to save journal:', error);
    }
  };

  if (isEdit && isLoadingJournal) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const accountOptions = accounts?.map(acc => ({
    value: String(acc.id),
    label: `${acc.code} - ${acc.name}`,
  })) || [];

  const projectOptions = projects?.map(proj => ({
    value: String(proj.id),
    label: proj.name,
  })) || [];

  const typeOptions = [
    { value: 'General', label: 'General' },
    { value: 'Payment', label: 'Payment' },
    { value: 'Receipt', label: 'Receipt' },
    { value: 'Contra', label: 'Contra' },
    { value: 'Journal', label: 'Journal' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/journals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Journal Entry</h1>
          <p className="text-muted-foreground">Record accounting transactions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Journal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Journal Date *</Label>
                <Input type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Reference Number</Label>
                <Input {...register('code')} placeholder="JV-001" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <SearchableSelect
                  options={typeOptions}
                  value={watch('type')}
                  onChange={(value) => setValue('type', value as any)}
                  placeholder="Select type"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectId">Project (Optional)</Label>
              <SearchableSelect
                options={[{ value: '', label: 'None' }, ...projectOptions]}
                value={watch('projectId') || ''}
                onChange={(value) => setValue('projectId', value)}
                placeholder="Select project (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration">Description *</Label>
              <Textarea
                {...register('narration')}
                placeholder="Brief description of the transaction"
                rows={2}
              />
              {errors.narration && (
                <p className="text-sm text-destructive">{errors.narration.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Journal Entries</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addEntry}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 text-sm font-medium w-1/3">Account</th>
                    <th className="text-right p-2 text-sm font-medium w-1/6">Debit</th>
                    <th className="text-right p-2 text-sm font-medium w-1/6">Credit</th>
                    <th className="text-left p-2 text-sm font-medium w-1/4">Narration</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map((entry, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <SearchableSelect
                          options={accountOptions}
                          value={entry.accountId}
                          onChange={(value) => updateEntry(index, 'accountId', value)}
                          placeholder="Select account"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={entry.debit}
                          onChange={(e) => updateEntry(index, 'debit', e.target.value)}
                          className="text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={entry.credit}
                          onChange={(e) => updateEntry(index, 'credit', e.target.value)}
                          className="text-right"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={entry.narration}
                          onChange={(e) => updateEntry(index, 'narration', e.target.value)}
                          placeholder="Optional note"
                        />
                      </td>
                      <td className="p-2 text-center">
                        {journalEntries.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEntry(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={`border-t-2 font-bold ${!isBalanced ? 'bg-destructive/10' : 'bg-muted'}`}>
                    <td className="p-2">Total</td>
                    <td className="p-2 text-right">{formatCurrency(totalDebit)}</td>
                    <td className="p-2 text-right">{formatCurrency(totalCredit)}</td>
                    <td className="p-2">
                      {!isBalanced && (
                        <span className="text-sm text-destructive">
                          Difference: {formatCurrency(Math.abs(difference))}
                        </span>
                      )}
                      {isBalanced && (
                        <span className="text-sm text-green-600">Balanced ✓</span>
                      )}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/accounts/journals')}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!isBalanced || createJournal.isPending || updateJournal.isPending}
          >
            {(createJournal.isPending || updateJournal.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Update' : 'Create'} Journal
          </Button>
        </div>
      </form>
    </div>
  );
}
