import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useMasterProjects, useMasterUOMs } from '@/lib/hooks/useMasters';
import { estimatesApi, bbsApi } from '@/lib/api/engineeringApi';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

import { ArrowLeft, Loader2, Calculator } from 'lucide-react';

const bbsSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  estimateId: z.string().min(1, 'Approved estimate is required'),
  description: z.string().optional(),
  quantity: z.string().min(1, 'Quantity is required'),
  uomId: z.string().min(1, 'UOM is required'),
  rate: z.string().min(1, 'Rate is required')
});

type BBSFormData = z.infer<typeof bbsSchema>;

export default function BBSForm() {
  const navigate = useNavigate();

  const { data: projects = [] } = useMasterProjects();
  const { data: uoms = [] } = useMasterUOMs();

  const form = useForm<BBSFormData>({
    resolver: zodResolver(bbsSchema),
    defaultValues: {
      projectId: '',
      estimateId: '',
      code: '',
      description: '',
      quantity: '',
      uomId: '',
      rate: ''
    }
  });

  const selectedProjectId = form.watch('projectId');
  const quantity = parseFloat(form.watch('quantity') || '0');
  const rate = parseFloat(form.watch('rate') || '0');

  const amount = useMemo(() => quantity * rate, [quantity, rate]);


  const [estimates, setEstimates] = useState<any[]>([]);
  const [loadingEstimates, setLoadingEstimates] = useState(false);

  /* ================= LOAD FINAL ESTIMATES ================= */

  useEffect(() => {
    if (!selectedProjectId) {
      setEstimates([]);
      return;
    }

    (async () => {
      try {
        setLoadingEstimates(true);

        const res = await estimatesApi.getByProject(Number(selectedProjectId));
        const list = Array.isArray(res) ? res : [];

        const finalEstimates = list.filter(
          (e: any) => e.status === 'FINAL'
        );

        setEstimates(finalEstimates);
      } catch (err) {
        toast.error('Failed to load estimates');
        setEstimates([]);
      } finally {
        setLoadingEstimates(false);
      }
    })();
  }, [selectedProjectId]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (data: BBSFormData) => {
    try {
      await bbsApi.create({
        projectId: Number(data.projectId),
        estimateId: Number(data.estimateId),
        // code: data.code,
        description: data.description,
        quantity: Number(data.quantity),
        uomId: Number(data.uomId),
        rate: Number(data.rate)
      });

      toast.success('BBS created successfully');
      navigate('/engineering/bbs');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create BBS');
    }
  };

  /* ================= OPTIONS ================= */

  const projectOptions = projects.map((p: any) => ({
    value: String(p.id),
    label: `${p.code} - ${p.name}`
  }));

  const estimateOptions = estimates.map((e: any) => ({
    value: String(e.id),
    label: e.name || `Estimate #${e.id}`
  }));

  const uomOptions = uoms.map((u: any) => ({
    value: String(u.id),
    label: `${u.code} - ${u.name}`
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/bbs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New BBS</h1>
          <p className="text-muted-foreground">
            Create BBS from approved estimate
          </p>
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
                name="estimateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approved Estimate *</FormLabel>
                    <FormControl>
                      <SearchableSelect
                        options={estimateOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder={
                          loadingEstimates
                            ? 'Loading estimates...'
                            : estimateOptions.length === 0
                              ? 'No approved estimates found'
                              : 'Select final estimate'
                        }
                        disabled={!selectedProjectId || loadingEstimates || estimateOptions.length === 0}
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
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder="Auto-generated by system"
                      />
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
                      <Textarea {...field} rows={3} />
                    </FormControl>
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

              {/* Auto calculated amount */}
              <div className="bg-muted/50 border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Auto Calculated
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="font-bold">
                    ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit">
              Create BBS
            </Button>
            <Button variant="outline" onClick={() => navigate('/engineering/bbs')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
