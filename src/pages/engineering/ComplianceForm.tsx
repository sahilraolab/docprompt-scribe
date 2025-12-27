import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useCompliance, useCreateCompliance, useUpdateCompliance } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Loader2 } from 'lucide-react';

const complianceSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  type: z.string().min(1, 'Type is required'),
  documentRef: z.string().optional(),
  validTill: z.string().optional(),
});

type ComplianceFormData = z.infer<typeof complianceSchema>;

export default function ComplianceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: projects = [] } = useMasterProjects();
  const { data: complianceData } = useCompliance(isEdit ? id : '');
  const createCompliance = useCreateCompliance();
  const updateCompliance = useUpdateCompliance();

  const form = useForm<ComplianceFormData>({
    resolver: zodResolver(complianceSchema),
    defaultValues: {
      projectId: '',
      type: '',
      documentRef: '',
      validTill: '',
    },
  });

  const projectsArray = Array.isArray(projects) ? projects : [];

  useEffect(() => {
    if (isEdit && complianceData) {
      form.reset({
        projectId: String(complianceData.projectId || ''),
        type: complianceData.type || '',
        documentRef: complianceData.documentRef || '',
        validTill: complianceData.validTill ? complianceData.validTill.split('T')[0] : '',
      });
    }
  }, [isEdit, complianceData, form]);

  const onSubmit = async (data: ComplianceFormData) => {
    const payload = {
      projectId: Number(data.projectId),
      type: data.type,
      documentRef: data.documentRef,
      validTill: data.validTill || undefined,
    };

    if (isEdit && id) {
      await updateCompliance.mutateAsync({ id, data: payload });
    } else {
      await createCompliance.mutateAsync(payload);
    }
    navigate('/engineering/compliance');
  };

  const projectOptions = projectsArray.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`,
  }));

  const typeOptions = [
    { value: 'RERA', label: 'RERA' },
    { value: 'ENVIRONMENT', label: 'Environment Clearance' },
    { value: 'FIRE_NOC', label: 'Fire NOC' },
    { value: 'BUILDING_PERMIT', label: 'Building Permit' },
    { value: 'COMPLETION', label: 'Completion Certificate' },
    { value: 'OCCUPANCY', label: 'Occupancy Certificate' },
    { value: 'OTHER', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/compliance')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'Add'} Compliance</h1>
          <p className="text-muted-foreground">Regulatory compliance record</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Details</CardTitle>
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={typeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select type"
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
                      <Input {...field} placeholder="Certificate number or reference" />
                    </FormControl>
                    <FormMessage />
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
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createCompliance.isPending || updateCompliance.isPending}>
              {(createCompliance.isPending || updateCompliance.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? 'Update Compliance' : 'Add Compliance'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/compliance')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
