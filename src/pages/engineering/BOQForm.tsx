import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { useBOQ, useCreateBOQ, useUpdateBOQ } from '@/lib/hooks/useBOQ';
import { useProjects } from '@/lib/hooks/useEngineering';
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
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const boqSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'BOQ name is required'),
  description: z.string().optional(),
  version: z.string().min(1, 'Version is required'),
  status: z.enum(['Draft', 'Approved', 'Revised', 'Archived']),
});

type BOQFormData = z.infer<typeof boqSchema>;

export default function BOQForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: boqData } = useBOQ(id || '');
  const { data: projects } = useProjects();
  const createBOQ = useCreateBOQ();
  const updateBOQ = useUpdateBOQ();

  const form = useForm<BOQFormData>({
    resolver: zodResolver(boqSchema),
    defaultValues: {
      projectId: '',
      name: '',
      description: '',
      version: '1',
      status: 'Draft',
    },
  });

  useEffect(() => {
    if (boqData && isEdit) {
      form.reset({
        projectId: boqData.projectId || '',
        name: boqData.name || '',
        description: boqData.description || '',
        version: String(boqData.version || '1'),
        status: boqData.status || 'Draft',
      });
    }
  }, [boqData, isEdit, form]);

  const onSubmit = async (data: BOQFormData) => {
    try {
      const payload: any = {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        version: parseInt(data.version),
        status: data.status,
        items: [],
        totalAmount: 0,
      };

      if (isEdit && id) {
        await updateBOQ.mutateAsync({ id, data: payload });
      } else {
        await createBOQ.mutateAsync(payload);
      }
      toast.success(isEdit ? 'BOQ updated successfully' : 'BOQ created successfully');
      navigate('/engineering/boq');
    } catch (error) {
      console.error('Failed to save BOQ:', error);
      toast.error('Failed to save BOQ');
    }
  };

  const projectOptions = (projects || []).map(p => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Revised', label: 'Revised' },
    { value: 'Archived', label: 'Archived' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/boq')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} BOQ</h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update BOQ details' : 'Create a new Bill of Quantities'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>BOQ Information</CardTitle>
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
                        searchPlaceholder="Search projects..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BOQ Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Main Building BOQ" />
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
                      <Textarea {...field} placeholder="BOQ description..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version *</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} placeholder="1" />
                      </FormControl>
                      <FormDescription>
                        BOQ version number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={statusOptions}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select status"
                          searchPlaceholder="Search status..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createBOQ.isPending || updateBOQ.isPending}>
              {isEdit ? 'Update BOQ' : 'Create BOQ'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/boq')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
