import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useCreateDrawing } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Loader2 } from 'lucide-react';

const drawingSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  title: z.string().min(1, 'Title is required'),
  drawingNo: z.string().min(1, 'Drawing number is required'),
  discipline: z.string().optional(),
});

type DrawingFormData = z.infer<typeof drawingSchema>;

export default function DrawingForm() {
  const navigate = useNavigate();
  const { data: projects = [] } = useMasterProjects();
  const createDrawing = useCreateDrawing();

  const form = useForm<DrawingFormData>({
    resolver: zodResolver(drawingSchema),
    defaultValues: {
      projectId: '',
      title: '',
      drawingNo: '',
      discipline: '',
    },
  });

  const projectsArray = Array.isArray(projects) ? projects : [];

  const onSubmit = async (data: DrawingFormData) => {
    await createDrawing.mutateAsync({
      projectId: Number(data.projectId),
      title: data.title,
      drawingNo: data.drawingNo,
      discipline: data.discipline,
    });
    navigate('/engineering/drawings');
  };

  const projectOptions = projectsArray.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`,
  }));

  const disciplineOptions = [
    { value: 'CIVIL', label: 'Civil' },
    { value: 'STRUCTURAL', label: 'Structural' },
    { value: 'ARCHITECTURAL', label: 'Architectural' },
    { value: 'MEP', label: 'MEP' },
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'PLUMBING', label: 'Plumbing' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/drawings')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Drawing</h1>
          <p className="text-muted-foreground">Add engineering drawing</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Drawing Details</CardTitle>
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
                name="drawingNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drawing Number *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="DWG-001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Floor Plan - Level 1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discipline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={disciplineOptions}
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Select discipline"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createDrawing.isPending}>
              {createDrawing.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Drawing
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/drawings')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
