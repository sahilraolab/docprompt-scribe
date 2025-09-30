import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils/format';

const journalEntrySchema = z.object({
  accountId: z.string().min(1, 'Account is required'),
  debit: z.number().min(0),
  credit: z.number().min(0),
  description: z.string().optional(),
});

const journalSchema = z.object({
  journalDate: z.string().min(1, 'Journal date is required'),
  reference: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  entries: z.array(journalEntrySchema).min(2, 'At least two entries are required'),
});

type JournalFormData = z.infer<typeof journalSchema>;

export default function JournalForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [journalEntries, setJournalEntries] = useState<any[]>([
    { accountId: '', debit: 0, credit: 0, description: '' },
    { accountId: '', debit: 0, credit: 0, description: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<JournalFormData>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      journalDate: new Date().toISOString().split('T')[0],
    },
  });

  const addEntry = () => {
    setJournalEntries([...journalEntries, { accountId: '', debit: 0, credit: 0, description: '' }]);
  };

  const removeEntry = (index: number) => {
    if (journalEntries.length > 2) {
      setJournalEntries(journalEntries.filter((_, i) => i !== index));
    }
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const updated = [...journalEntries];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-clear opposite side when one is entered
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

  const onSubmit = (data: JournalFormData) => {
    if (!isBalanced) {
      toast({
        title: 'Error',
        description: 'Journal entries must balance. Debit and Credit totals must be equal.',
        variant: 'destructive',
      });
      return;
    }

    console.log('Journal Data:', { ...data, totalDebit, totalCredit });
    toast({
      title: id ? 'Journal Updated' : 'Journal Created',
      description: `Journal entry has been ${id ? 'updated' : 'created'} successfully.`,
    });
    navigate('/accounts/journals');
  };

  // Mock accounts
  const accounts = [
    { id: '1', code: '1000', name: 'Cash', type: 'Asset' },
    { id: '2', code: '1100', name: 'Bank Account', type: 'Asset' },
    { id: '3', code: '2000', name: 'Accounts Payable', type: 'Liability' },
    { id: '4', code: '3000', name: 'Capital', type: 'Equity' },
    { id: '5', code: '4000', name: 'Revenue', type: 'Income' },
    { id: '6', code: '5000', name: 'Material Cost', type: 'Expense' },
    { id: '7', code: '5100', name: 'Labour Cost', type: 'Expense' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/journals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Journal Entry</h1>
          <p className="text-muted-foreground">Record accounting transactions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Journal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="journalDate">Journal Date *</Label>
                <Input type="date" {...register('journalDate')} />
                {errors.journalDate && (
                  <p className="text-sm text-destructive">{errors.journalDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input {...register('reference')} placeholder="REF-001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                {...register('description')}
                placeholder="Brief description of the transaction"
                rows={2}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
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
                    <th className="text-left p-2 text-sm font-medium w-1/4">Description</th>
                    <th className="w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {journalEntries.map((entry, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Select
                          value={entry.accountId}
                          onValueChange={(value) => updateEntry(index, 'accountId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          value={entry.description}
                          onChange={(e) => updateEntry(index, 'description', e.target.value)}
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
          <Button type="submit" disabled={!isBalanced}>
            {id ? 'Update' : 'Create'} Journal
          </Button>
        </div>
      </form>
    </div>
  );
}
