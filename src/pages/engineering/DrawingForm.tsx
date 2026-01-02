import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useMasterProjects } from '@/lib/hooks/useMasters';
import {
  useCreateDrawing,
  useReviseDrawing,
  useDrawing
} from '@/lib/hooks/useEngineering';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';

import { ArrowLeft, Loader2, Lock } from 'lucide-react';

/* =====================================================
   SCHEMAS (MODE-BASED)
===================================================== */

const createSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  title: z.string().min(1, 'Title is required'),
  discipline: z.string().optional()
});

const reviseSchema = z.object({
  changeNote: z.string().min(1, 'Change note is required')
});

type CreateForm = z.infer<typeof createSchema>;
type ReviseForm = z.infer<typeof reviseSchema>;

type FormData = CreateForm & ReviseForm;

/* =====================================================
   COMPONENT
===================================================== */

export default function DrawingForm() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const mode = params.get('mode'); // ?mode=revise
  const isCreate = !id || id === 'new';
  const isRevise = !isCreate && mode === 'revise';

  /* ================= DATA ================= */

  const { data: projects = [] } = useMasterProjects();
  const { data: drawing } = useDrawing(!isCreate ? id! : '');

  const createDrawing = useCreateDrawing();
  const reviseDrawing = useReviseDrawing();

  const isApproved = useMemo(
    () => drawing?.status === 'APPROVED',
    [drawing]
  );

  /* ================= FORM ================= */

  const form = useForm<FormData>({
    resolver: zodResolver(isCreate ? createSchema : reviseSchema),
    defaultValues: {
      projectId: '',
      title: '',
      discipline: '',
      changeNote: ''
    }
  });

  /* ================= INIT ================= */

  useEffect(() => {
    if (isRevise && drawing) {
      form.reset({
        changeNote: ''
      });
    }
  }, [drawing, isRevise, form]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: FormData) => {
    try {
      if (isCreate) {
        await createDrawing.mutateAsync({
          projectId: Number(data.projectId),
          title: data.title!,
          discipline: data.discipline
        });

        toast.success('Drawing created successfully');
      }

      if (isRevise) {
        if (isApproved) {
          toast.error('Approved drawing cannot be revised');
          return;
        }

        await reviseDrawing.mutateAsync({
          drawingId: Number(id),
          changeNote: data.changeNote!
        });

        toast.success('Revision added successfully');
      }

      navigate('/engineering/drawings');
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    }
  };

  /* ================= OPTIONS ================= */

  const projectOptions = projects.map(p => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`
  }));

  const disciplineOptions = [
    { value: 'CIVIL', label: 'Civil' },
    { value: 'STRUCTURAL', label: 'Structural' },
    { value: 'ARCHITECTURAL', label: 'Architectural' },
    { value: 'MEP', label: 'MEP' },
    { value: 'ELECTRICAL', label: 'Electrical' },
    { value: 'PLUMBING', label: 'Plumbing' }
  ];

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/engineering/drawings')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">
            {isCreate ? 'New Drawing' : 'Add Drawing Revision'}
          </h1>
          <p className="text-muted-foreground">
            {isCreate
              ? 'Create engineering drawing'
              : 'Add revision note'}
          </p>
        </div>

        {isApproved && (
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 text-amber-700">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">
              Approved – Locked
            </span>
          </div>
        )}
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {isCreate ? 'Drawing Details' : 'Revision Note'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {isCreate && (
                <>
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
                          />
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
                          <Input {...field} />
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
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {isRevise && !isApproved && (
                <FormField
                  control={form.control}
                  name="changeNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Change Note *</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            {!isApproved && (
              <Button
                type="submit"
                disabled={
                  createDrawing.isPending ||
                  reviseDrawing.isPending
                }
              >
                {(createDrawing.isPending ||
                  reviseDrawing.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isCreate ? 'Create Drawing' : 'Add Revision'}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => navigate('/engineering/drawings')}
            >
              Back
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
