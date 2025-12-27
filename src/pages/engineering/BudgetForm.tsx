import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjects, useCreateBudget } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Loader2 } from 'lucide-react';

const budgetSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  totalBudget: z.string().min(1, 'Budget amount is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export default function BudgetForm() {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const createBudget = useCreateBudget();

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      projectId: '',
      totalBudget: '',
    },
  });

  const projectsArray = Array.isArray(projects) ? projects : [];

  const onSubmit = async (data: BudgetFormData) => {
    await createBudget.mutateAsync({
      projectId: Number(data.projectId),
      totalBudget: Number(data.totalBudget),
    });
    navigate('/engineering/budget');
  };

  const projectOptions = projectsArray.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/budget')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Budget</h1>
          <p className="text-muted-foreground">Allocate budget for a project</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={projectOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select project"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Budget (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} placeholder="Enter budget amount" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createBudget.isPending}>
              {createBudget.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Budget
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/budget')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
