import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterProjects, useMasterUOMs } from '@/lib/hooks/useMasters';
import { useBBS, useCreateBBS, useUpdateBBS } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Loader2 } from 'lucide-react';

const bbsSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required'),
  uomId: z.string().min(1, 'UOM is required'),
  rate: z.string().min(1, 'Rate is required'),
});

type BBSFormData = z.infer<typeof bbsSchema>;

export default function BBSForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: projects = [] } = useMasterProjects();
  const { data: uoms = [] } = useMasterUOMs();
  const { data: bbsData } = useBBS(isEdit ? id : '');
  const createBBS = useCreateBBS();
  const updateBBS = useUpdateBBS();

  const form = useForm<BBSFormData>({
    resolver: zodResolver(bbsSchema),
    defaultValues: {
      projectId: '',
      code: '',
      description: '',
      quantity: '',
      uomId: '',
      rate: '',
    },
  });

  const projectsArray = Array.isArray(projects) ? projects : [];
  const uomsArray = Array.isArray(uoms) ? uoms : [];

  useEffect(() => {
    if (isEdit && bbsData) {
      form.reset({
        projectId: String(bbsData.projectId || ''),
        code: bbsData.code || '',
        description: bbsData.description || '',
        quantity: String(bbsData.quantity || ''),
        uomId: String(bbsData.uomId || ''),
        rate: String(bbsData.rate || ''),
      });
    }
  }, [isEdit, bbsData, form]);

  const onSubmit = async (data: BBSFormData) => {
    const payload = {
      ...data,
      projectId: Number(data.projectId),
      uomId: Number(data.uomId),
      quantity: Number(data.quantity),
      rate: Number(data.rate),
    };

    if (isEdit && id) {
      await updateBBS.mutateAsync({ id, data: payload });
    } else {
      await createBBS.mutateAsync(payload);
    }
    navigate('/engineering/bbs');
  };

  const projectOptions = projectsArray.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`,
  }));

  const uomOptions = uomsArray.map((u: any) => ({
    value: String(u.id),
    label: `${u.code} - ${u.name}`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/bbs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} BBS</h1>
          <p className="text-muted-foreground">Bar Bending Schedule entry</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BBS Details</CardTitle>
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
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="BBS-001" />
                    </FormControl>
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
                      <Textarea {...field} rows={3} placeholder="Description..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UOM *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={uomOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select UOM"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (₹) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createBBS.isPending || updateBBS.isPending}>
              {(createBBS.isPending || updateBBS.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? 'Update BBS' : 'Create BBS'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/bbs')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
