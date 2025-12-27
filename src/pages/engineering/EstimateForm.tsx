import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useProjects, useEstimate, useCreateEstimate, useAddEstimateVersion } from '@/lib/hooks/useEngineering';
import { useMaterialMaster } from '@/lib/hooks/useMaterialMaster'; // ✅ import material hook
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/SearchableSelect';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash, Loader2 } from 'lucide-react';

// -------------------------------
// Validation schema
// -------------------------------
const estimateSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Estimate name is required'),
  version: z.string().min(1, 'Version is required'),
  taxRate: z.string().optional(),
  description: z.string().optional(),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

export default function EstimateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  // API hooks
  const { data: projectsData } = useProjects();
  const { data: materialsData } = useMaterialMaster(); // ✅ materials list
  const { data: estimateData } = useEstimate(isEdit ? (id as string) : '');
  const createEstimate = useCreateEstimate();
  const addEstimateVersion = useAddEstimateVersion();

  // local state
  type UIItem = { itemId: string; description: string; uom: string; qty: string; rate: string };
  const [items, setItems] = useState<UIItem[]>([{ itemId: '', description: '', uom: '', qty: '', rate: '' }]);

  // react-hook-form setup
  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      projectId: '',
      name: '',
      version: '1.0',
      taxRate: '18',
      description: '',
    },
  });

  // Normalize project list
  const projectsArray = Array.isArray(projectsData?.data) ? projectsData.data : (projectsData || []);

  // Normalize material list
  const materialsArray = Array.isArray(materialsData?.data) ? materialsData.data : (materialsData || []);

  // Prefill on edit
  useEffect(() => {
    if (isEdit && estimateData) {
      const raw = (estimateData as any).data ? (estimateData as any).data : estimateData;
      form.reset({
        projectId: raw.projectId?._id || raw.projectId,
        name: raw.name || '',
        version: raw.version?.toString() || '1.0',
        taxRate: raw.taxRate?.toString() || '18',
        description: raw.description || '',
      });

      if (Array.isArray(raw.items) && raw.items.length > 0) {
        setItems(
          raw.items.map((it: any) => ({
            itemId: it.itemId?._id || it.itemId || '',
            description: it.description || '',
            uom: it.uom || '',
            qty: it.qty?.toString() || '',
            rate: it.rate?.toString() || '',
          }))
        );
      }
    }
  }, [isEdit, estimateData, form]);

  // Handlers
  const addItem = () => setItems([...items, { itemId: '', description: '', uom: '', qty: '', rate: '' }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  const calculateItemAmount = (q: string, r: string) => (Number(q) || 0) * (Number(r) || 0);
  const calculateTotal = () => items.reduce((s, i) => s + calculateItemAmount(i.qty, i.rate), 0);

  const onSubmit = async (data: EstimateFormData) => {
    try {
      if (!items.length) return toast.error('Add at least one item');

      const mappedItems = items.map((it) => ({
        itemId: it.itemId || undefined,
        description: it.description.trim(),
        uom: it.uom,
        qty: Number(it.qty),
        rate: Number(it.rate),
        amount: calculateItemAmount(it.qty, it.rate),
      }));

      const subtotal = mappedItems.reduce((s, it) => s + it.amount, 0);
      const taxRate = Number(data.taxRate ?? 18);
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      const payload = {
        projectId: data.projectId,
        name: data.name,
        version: data.version,
        description: data.description,
        taxRate,
        items: mappedItems,
        subtotal,
        taxAmount,
        totalAmount,
        status: 'Draft',
      };

      if (isEdit && id) {
        await addEstimateVersion.mutateAsync({ estimateId: id, ...payload });
        toast.success('Estimate version added successfully');
      } else {
        await createEstimate.mutateAsync(payload);
        toast.success('Estimate created successfully');
      }

      navigate('/engineering/estimates');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save estimate');
    }
  };

  const projectOptions = projectsArray.map((p: any) => ({
    value: p._id,
    label: `${p.code} - ${p.name}`,
  }));

  const materialOptions = materialsArray.map((m: any) => ({
    value: m._id,
    label: `${m.code} - ${m.name}`,
  }));

  const units = ['SQM', 'CUM', 'RMT', 'NOS', 'KG', 'TON', 'BAG', 'LTR'];

  // -------------------------------
  // JSX
  // -------------------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/engineering/estimates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Estimate</h1>
          <p className="text-muted-foreground">Create project cost estimate</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* --- Estimate Header --- */}
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
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
                    <FormLabel>Estimate Name *</FormLabel>
                    <FormControl><Input {...field} placeholder="Phase 1 Estimate" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="version" render={({ field }) => (
                  <FormItem><FormLabel>Version *</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )}/>
                <FormField control={form.control} name="taxRate" render={({ field }) => (
                  <FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                )}/>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea {...field} rows={3} placeholder="Notes..." /></FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* --- Estimate Items --- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estimate Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((it, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Item {idx + 1}</h4>
                    {items.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {/* Material Dropdown */}
                  <SearchableSelect
                    options={materialOptions}
                    value={it.itemId}
                    onChange={(val) => {
                      const next = [...items];
                      next[idx].itemId = val;
                      const material = materialsArray.find((m: any) => m._id === val);
                      if (material) {
                        next[idx].description = material.name || '';
                        next[idx].uom = material.unit || material.uom || '';
                        next[idx].rate = String(material.stdRate || material.rate || '');
                      }
                      setItems(next);
                    }}
                    placeholder="Select Material"
                    searchPlaceholder="Search materials..."
                  />

                  {/* Other Fields */}
                  <Input
                    placeholder="Description *"
                    value={it.description}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].description = e.target.value;
                      setItems(next);
                    }}
                  />
                  <SearchableSelect
                    options={units.map((u) => ({ value: u, label: u }))}
                    value={it.uom}
                    onChange={(val) => {
                      const next = [...items];
                      next[idx].uom = val;
                      setItems(next);
                    }}
                    placeholder="Select Unit"
                  />
                  <Input
                    type="number"
                    placeholder="Quantity"
                    value={it.qty}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].qty = e.target.value;
                      setItems(next);
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Rate (₹)"
                    value={it.rate}
                    onChange={(e) => {
                      const next = [...items];
                      next[idx].rate = e.target.value;
                      setItems(next);
                    }}
                  />

                  <div className="flex justify-between bg-muted p-3 rounded">
                    <span>Amount:</span>
                    <span className="font-semibold">
                      ₹{calculateItemAmount(it.qty, it.rate).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-end bg-muted rounded p-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Estimate</p>
                  <p className="text-2xl font-bold">₹{calculateTotal().toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={createEstimate.isPending || addEstimateVersion.isPending}>
              {(createEstimate.isPending || addEstimateVersion.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              {isEdit ? 'Update Estimate' : 'Create Estimate'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/engineering/estimates')}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
