import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useMasterProjects } from '@/lib/hooks/useMasters';
import {
  useCompliance,
  useCreateCompliance,
  useUpdateCompliance
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
import { SearchableSelect } from '@/components/SearchableSelect';

import { ArrowLeft, Loader2, Lock } from 'lucide-react';

/* ================= SCHEMA ================= */

const schema = z.object({
  projectId: z.string().min(1),
  type: z.string().min(1),
  documentRef: z.string().optional(),
  validTill: z.string().optional()
});

type FormData = z.infer<typeof schema>;

/* ================= COMPONENT ================= */

export default function ComplianceForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id && id !== 'new');

  /* ================= DATA ================= */

  const { data: projects = [], isLoading: projectsLoading } =
    useMasterProjects();

  // const { data: compliance, isLoading: complianceLoading } =
  //   useCompliance(isEdit ? String(id) : '');

  const complianceId = isEdit ? Number(id) : undefined;

  const { data: compliance, isLoading: complianceLoading } =
    useCompliance(complianceId);

  const createCompliance = useCreateCompliance();
  const updateCompliance = useUpdateCompliance();

  const isLocked = useMemo(
    () => compliance?.status === 'CLOSED',
    [compliance]
  );

  /* ================= FORM ================= */

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectId: '',
      type: '',
      documentRef: '',
      validTill: ''
    }
  });

  /* ================= INIT (EDIT MODE) ================= */

  useEffect(() => {
    if (!isEdit || !compliance) return;

    form.reset({
      projectId: String(compliance.projectId),
      type: compliance.type,
      documentRef: compliance.documentRef || '',
      validTill: compliance.validTill
        ? compliance.validTill.slice(0, 10)
        : ''
    });
  }, [isEdit, compliance, form]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: FormData) => {
    if (isLocked) return;

    try {
      if (isEdit && id) {
        await updateCompliance.mutateAsync({
          id: Number(id),
          data: {
            type: data.type,
            documentRef: data.documentRef || null,
            validTill: data.validTill || null
          }
        });
        toast.success('Compliance updated');
      } else {
        await createCompliance.mutateAsync({
          projectId: Number(data.projectId),
          type: data.type,
          documentRef: data.documentRef || null,
          validTill: data.validTill || null
        });
        toast.success('Compliance added');
      }

      navigate('/engineering/compliance');
    } catch (e: any) {
      toast.error(e.message || 'Operation failed');
    }
  };

  /* ================= OPTIONS ================= */

  const projectOptions = projects.map(p => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`
  }));

  const typeOptions = [
    { value: 'RERA', label: 'RERA' },
    { value: 'ENVIRONMENT', label: 'Environment Clearance' },
    { value: 'FIRE_NOC', label: 'Fire NOC' },
    { value: 'BUILDING_PERMIT', label: 'Building Permit' },
    { value: 'COMPLETION', label: 'Completion Certificate' },
    { value: 'OCCUPANCY', label: 'Occupancy Certificate' },
    { value: 'OTHER', label: 'Other' }
  ];

  if (projectsLoading || (isEdit && complianceLoading)) {
    return null;
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/engineering/compliance')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Edit Compliance' : 'Add Compliance'}
          </h1>
          <p className="text-muted-foreground">
            Regulatory & statutory compliance record
          </p>
        </div>

        {isLocked && (
          <div className="ml-auto flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-md">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Closed – Locked</span>
          </div>
        )}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={typeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={isLocked}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="documentRef"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Reference</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLocked} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="validTill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Till</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isLocked} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {!isLocked && (
            <Button
              type="submit"
              disabled={
                createCompliance.isPending ||
                updateCompliance.isPending
              }
            >
              {(createCompliance.isPending ||
                updateCompliance.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
              {isEdit ? 'Update Compliance' : 'Add Compliance'}
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
}
