import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/SearchableSelect';
import { useProjects } from '@/lib/hooks/useProjects';
import { useItems } from '@/lib/hooks/useSite';
import { useCreateMR, useUpdateMR, useMR } from '@/lib/hooks/usePurchaseBackend';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const mrItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  description: z.string().min(1, 'Description is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  uom: z.string().min(1, 'UOM is required'),
  requiredBy: z.string().optional(),
});

const mrSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  items: z.array(mrItemSchema).min(1, 'At least one item is required'),
}).refine((data) => {
  const today = new Date().toISOString().split('T')[0];
  return data.items.every(item => !item.requiredBy || item.requiredBy >= today);
}, {
  message: 'Required date must be today or in the future',
  path: ['items'],
});

type MRFormData = z.infer<typeof mrSchema>;

export default function MRForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: mrData } = useMR(id || '');
  const createMR = useCreateMR();
  const updateMR = useUpdateMR();
  
  const [mrItems, setMRItems] = useState<MRFormData['items']>([
    { itemId: '', description: '', qty: 1, uom: '', requiredBy: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<MRFormData>({
    resolver: zodResolver(mrSchema),
    defaultValues: { items: mrItems as any, projectId: '' },
  });

  const selectedProjectId = watch('projectId');

  useEffect(() => {
    if (mrData && id) {
      setValue('projectId', mrData.projectId || '');
      const formattedItems = mrData.items?.map((item: any) => ({
        itemId: item.itemId || '',
        description: item.description || '',
        qty: item.qty || 0,
        uom: item.uom || '',
        requiredBy: item.requiredBy ? item.requiredBy.split('T')[0] : '',
      })) || [];
      setMRItems(formattedItems);
      setValue('items', formattedItems);
    }
  }, [mrData, id, setValue]);

  const addItem = () => {
    const newItems = [...mrItems, { itemId: '', description: '', qty: 1, uom: '', requiredBy: '' }];
    setMRItems(newItems);
    setValue('items', newItems);
  };

  const removeItem = (index: number) => {
    if (mrItems.length > 1) {
      const newItems = mrItems.filter((_, i) => i !== index);
      setMRItems(newItems);
      setValue('items', newItems);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...mrItems];
    updated[index] = { ...updated[index], [field]: value };
    setMRItems(updated);
    setValue('items', updated);
  };

  const projectOptions = (Array.isArray(projects) ? projects : []).map(project => ({
    value: project.id,
    label: `${project.name} (${project.code})`,
  }));

  const itemOptions = (Array.isArray(items) ? items : []).map(item => ({
    value: item.id,
    label: `${item.name} (${item.code})`,
  }));

  const onSubmit = (data: MRFormData) => {
    if (id) {
      updateMR.mutate({ id, data: data as any }, {
        onSuccess: () => {
          toast.success('MR updated successfully');
          navigate('/purchase/mrs');
        },
      });
    } else {
      createMR.mutate(data as any, {
        onSuccess: () => {
          toast.success('MR created successfully');
          navigate('/purchase/mrs');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/mrs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Material Requisition</h1>
          <p className="text-muted-foreground">
            {id ? 'Update material requisition details' : 'Create a new material requisition'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectId">Project *</Label>
              <SearchableSelect
                options={projectOptions}
                value={selectedProjectId}
                onChange={(value) => setValue('projectId', value)}
                placeholder="Select project"
                searchPlaceholder="Search projects..."
                disabled={projectsLoading}
              />
              {errors.projectId && (
                <p className="text-sm text-destructive">{errors.projectId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mrItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {mrItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item *</Label>
                    <SearchableSelect
                      options={itemOptions}
                      value={item.itemId}
                      onChange={(value) => {
                        const selectedItem = items?.find((i) => i.id === value);
                        updateItem(index, 'itemId', value);
                        if (selectedItem) {
                          updateItem(index, 'description', selectedItem.name);
                          updateItem(index, 'uom', selectedItem.uom);
                        }
                      }}
                      placeholder="Select item"
                      searchPlaceholder="Search items..."
                      disabled={itemsLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value))}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>UOM *</Label>
                    <Input
                      value={item.uom}
                      onChange={(e) => updateItem(index, 'uom', e.target.value)}
                      placeholder="Unit of measurement"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Required By</Label>
                    <Input
                      type="date"
                      value={item.requiredBy}
                      onChange={(e) => updateItem(index, 'requiredBy', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/purchase/mrs')}>
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} MR</Button>
        </div>
      </form>
    </div>
  );
}
