import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useCreateEstimate, useAddEstimateVersion } from '@/lib/hooks/useEngineering';

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
import { SearchableSelect } from '@/components/SearchableSelect';

import { ArrowLeft, Loader2, Lock } from 'lucide-react';

const createSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Estimate name is required'),
  amount: z.string().min(1, 'Amount is required')
});

const versionSchema = z.object({
  amount: z.string().min(1, 'Amount is required')
});


type FormData = z.infer<typeof schema>;

export default function EstimateForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id && id !== 'new');

  const { data: projects = [] } = useMasterProjects();
  const createEstimate = useCreateEstimate();
  const addVersion = useAddEstimateVersion();

  const form = useForm<FormData>({
    resolver: zodResolver(isEdit ? versionSchema : createSchema),
    defaultValues: {
      projectId: '',
      name: '',
      amount: ''
    }
  });

  /* ================= PREFILL FOR EDIT ================= */

  useEffect(() => {
    if (!isEdit) return;

    /**
     * IMPORTANT:
     * We do NOT refetch estimate by ID.
     * Edit page is ONLY for adding a version.
     * Minimal safe defaults are used.
     */
    form.reset({
      projectId: '',
      name: '',
      amount: ''
    });
  }, [isEdit, form]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit && id) {
        await addVersion.mutateAsync({
          estimateId: Number(id),
          amount: Number(data.amount)
        });

        toast.success('Estimate version added');
      } else {
        await createEstimate.mutateAsync({
          projectId: Number(data.projectId),
          name: data.name,
          baseAmount: Number(data.amount)
        });

        toast.success('Estimate created');
      }

      navigate('/engineering/estimates');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save estimate');
    }
  };

  /* ================= OPTIONS ================= */

  const projectOptions = projects.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`
  }));

  /* ================= RENDER ================= */

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/engineering/estimates')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Add Estimate Version' : 'New Estimate'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? 'Create a new version for an existing estimate'
              : 'Create a project cost estimate'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Project */}
              {!isEdit && (
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
              )}

              {isEdit && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  Project & name are locked for existing estimates
                </div>
              )}

              {/* Name */}
              {!isEdit && (
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimate Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Phase 1 Estimate" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isEdit ? 'New Version Amount *' : 'Base Amount *'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        placeholder="Enter amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={createEstimate.isPending || addVersion.isPending}
            >
              {(createEstimate.isPending || addVersion.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? 'Add Version' : 'Create Estimate'}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/engineering/estimates')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
