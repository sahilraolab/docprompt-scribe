import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { useBOQ, useCreateBOQ, useUpdateBOQ } from '@/lib/hooks/useBOQ';
import { useMasterProjects } from '@/lib/hooks/useMasters';
import { useMaterialMaster } from '@/lib/hooks/useMaterialMaster';
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
import { ArrowLeft, Plus, Trash, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const boqSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'BOQ name is required'),
  description: z.string().optional(),
  status: z.enum(['Draft', 'Approved', 'Revised', 'Archived']),
});

type BOQFormData = z.infer<typeof boqSchema>;

type BOQItemUI = {
  materialId?: string;
  description: string;
  uom: string;
  qty: string;
  rate: string;
  remarks?: string;
};

export default function BOQForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: boqData } = useBOQ(id || '');
  const { data: projects } = useMasterProjects();
  const { data: materialsData } = useMaterialMaster();
  const createBOQ = useCreateBOQ();
  const updateBOQ = useUpdateBOQ();

  const form = useForm<BOQFormData>({
    resolver: zodResolver(boqSchema),
    defaultValues: {
      projectId: '',
      name: '',
      description: '',
      status: 'Draft',
    },
  });

  const [items, setItems] = useState<BOQItemUI[]>([
    { description: '', uom: '', qty: '', rate: '', remarks: '' },
  ]);

  const materials = ((materialsData as any)?.data || materialsData || []) as any[];
  const materialOptions = materials.map((m: any) => ({
    value: m._id || m.id,
    label: `${m.code || ''} - ${m.name}`,
    uom: m.uom,
    rate: m.standardRate,
  }));

  const projectOptions = (projects || []).map((p) => ({
    value: String(p.id),
    label: `${p.code || ''} - ${p.name || ''}`,
  }));

  const statusOptions = [
    { value: 'Draft', label: 'Draft' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Revised', label: 'Revised' },
    { value: 'Archived', label: 'Archived' },
  ];

  const units = ['SQM', 'CUM', 'RMT', 'NOS', 'KG', 'TON', 'BAG', 'LTR'];

  // Prefill on edit
  useEffect(() => {
    if (boqData && isEdit) {
      form.reset({
        projectId: boqData.projectId?._id || boqData.projectId || '',
        name: boqData.name || '',
        description: boqData.description || '',
        status: boqData.status || 'Draft',
      });

      if (Array.isArray(boqData.items) && boqData.items.length) {
        setItems(
          boqData.items.map((it: any) => ({
            materialId: it.itemId || it.item?._id || it.itemId?._id || '',
            description: it.description || it.itemName || '',
            uom: it.uom || '',
            qty: String(it.qty ?? ''),
            rate: String(it.rate ?? it.estimatedRate ?? ''),
            remarks: it.remarks || '',
          }))
        );
      }
    }
  }, [boqData, isEdit, form]);

  const addItem = () =>
    setItems([...items, { description: '', uom: '', qty: '', rate: '', remarks: '' }]);

  const removeItem = (index: number) =>
    setItems(items.filter((_, i) => i !== index));

  const calculateItemAmount = (qty: string, rate: string) => {
    const q = parseFloat(qty || '0');
    const r = parseFloat(rate || '0');
    return isNaN(q) || isNaN(r) ? 0 : q * r;
  };

  const calculateTotal = () =>
    items.reduce((sum, it) => sum + calculateItemAmount(it.qty, it.rate), 0);

  const onSubmit = async (data: BOQFormData) => {
    try {
      if (!items.length) {
        toast.error('Add at least one BOQ item');
        return;
      }

      for (const [idx, it] of items.entries()) {
        const hasAll = (it.description?.trim() || it.materialId) && it.uom && it.qty && it.rate;
        const q = parseFloat(it.qty);
        const r = parseFloat(it.rate);
        if (!hasAll || isNaN(q) || isNaN(r) || q <= 0 || r < 0) {
          toast.error(`Please complete item ${idx + 1} with valid quantity and rate`);
          return;
        }
      }

      const mappedItems = items.map((it) => ({
        itemId: it.materialId,
        description: it.description,
        qty: parseFloat(it.qty),
        uom: it.uom,
        rate: parseFloat(it.rate),
        amount: parseFloat(it.qty) * parseFloat(it.rate),
        remarks: it.remarks || '',
      }));

      const totalAmount = mappedItems.reduce((sum, i) => sum + i.amount, 0);

      const payload = {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        status: data.status,
        items: mappedItems,
        totalAmount,
      };

      if (isEdit && id) {
        await updateBOQ.mutateAsync({ id, data: payload });
        toast.success('BOQ updated successfully');
      } else {
        await createBOQ.mutateAsync(payload);
        toast.success('BOQ created successfully');
      }

      navigate('/engineering/boq');
    } catch (error) {
      console.error('Failed to save BOQ:', error);
      toast.error('Failed to save BOQ');
    }
  };

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
          {/* --- BOQ Info --- */}
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
                        value={String(field.value || '')}
                        onChange={(val) => field.onChange(String(val))}
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
            </CardContent>
          </Card>

          {/* --- BOQ Items --- */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>BOQ Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {items.map((it, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SearchableSelect
                      options={materialOptions}
                      value={it.materialId || ''}
                      onChange={(value) => {
                        const selected = materialOptions.find((o) => o.value === value);
                        const next = [...items];
                        next[index].materialId = value;

                        if (selected) {
                          next[index].description = selected.label.split(' - ').slice(1).join(' - ');
                          next[index].uom = selected.uom || '';
                          next[index].rate =
                            selected.rate != null ? String(selected.rate) : '';
                        }

                        setItems(next);
                      }}
                      placeholder="Select material"
                      searchPlaceholder="Search materials..."
                    />

                    <Input
                      placeholder="Description *"
                      value={it.description}
                      onChange={(e) => {
                        const next = [...items];
                        next[index].description = e.target.value;
                        setItems(next);
                      }}
                    />

                    <SearchableSelect
                      options={units.map((u) => ({ value: u, label: u }))}
                      value={it.uom}
                      onChange={(value) => {
                        const next = [...items];
                        next[index].uom = value;
                        setItems(next);
                      }}
                      placeholder="Select UOM"
                    />

                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={it.qty}
                      onChange={(e) => {
                        const next = [...items];
                        next[index].qty = e.target.value;
                        setItems(next);
                      }}
                    />

                    <Input
                      type="number"
                      placeholder="Rate (₹)"
                      value={it.rate}
                      onChange={(e) => {
                        const next = [...items];
                        next[index].rate = e.target.value;
                        setItems(next);
                      }}
                    />

                    <Textarea
                      placeholder="Remarks (optional)"
                      value={it.remarks || ''}
                      onChange={(e) => {
                        const next = [...items];
                        next[index].remarks = e.target.value;
                        setItems(next);
                      }}
                      rows={2}
                    />

                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        ₹{calculateItemAmount(it.qty, it.rate).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end p-4 bg-muted rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total BOQ</p>
                  <p className="text-2xl font-bold">
                    ₹{calculateTotal().toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* --- Actions --- */}
          <div className="flex gap-4">
            <Button type="submit" disabled={createBOQ.isPending || updateBOQ.isPending}>
              {(createBOQ.isPending || updateBOQ.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
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
