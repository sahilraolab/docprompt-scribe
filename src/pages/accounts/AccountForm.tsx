import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const accountSchema = z.object({
  code: z.string().min(1, 'Account code is required').max(20),
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['Asset', 'Liability', 'Equity', 'Income', 'Expense']),
  parentAccountId: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean(),
});

type AccountFormData = z.infer<typeof accountSchema>;

export default function AccountForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'Asset',
      parentAccountId: '',
      description: '',
      active: true,
    },
  });

  const onSubmit = (data: AccountFormData) => {
    console.log('Account data:', data);
    toast({
      title: isEdit ? 'Account Updated' : 'Account Created',
      description: `Account ${data.code} has been ${isEdit ? 'updated' : 'created'} successfully.`,
    });
    navigate('/accounts/list');
  };

  // Mock parent accounts
  const parentAccounts = [
    { id: '1', code: '1000', name: 'Current Assets', type: 'Asset' },
    { id: '2', code: '2000', name: 'Current Liabilities', type: 'Liability' },
    { id: '3', code: '3000', name: 'Owner Equity', type: 'Equity' },
    { id: '4', code: '4000', name: 'Operating Revenue', type: 'Income' },
    { id: '5', code: '5000', name: 'Operating Expenses', type: 'Expense' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/list')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Account</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update account details' : 'Create a new chart of accounts entry'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="1100" />
                      </FormControl>
                      <FormDescription>
                        Unique numeric code for the account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={[
                            { value: 'Asset', label: 'Asset' },
                            { value: 'Liability', label: 'Liability' },
                            { value: 'Equity', label: 'Equity' },
                            { value: 'Income', label: 'Income' },
                            { value: 'Expense', label: 'Expense' },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Bank Account - HDFC" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Account</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={[
                          { value: '', label: 'None (Top Level)' },
                          ...parentAccounts.map((account) => ({
                            value: account.id,
                            label: `${account.code} - ${account.name}`,
                          })),
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select parent account (optional)"
                      />
                    </FormControl>
                    <FormDescription>
                      Create sub-accounts by selecting a parent
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Additional notes about this account"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Inactive accounts cannot be used in transactions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit">
              {isEdit ? 'Update Account' : 'Create Account'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/accounts/list')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
