import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useProjects, useEstimate, useCreateEstimate, useUpdateEstimate } from '@/lib/hooks/useEngineering';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft, Plus, Trash, Loader2 } from 'lucide-react';

const estimateItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['Material', 'Labour', 'Equipment', 'Overhead']).default('Material'),
  unit: z.string().min(1, 'Unit is required'),
  qty: z.string().min(1, 'Quantity is required'),
  rate: z.string().min(1, 'Rate is required'),
});

const estimateSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  version: z.string().min(1, 'Version is required'),
  description: z.string().optional(),
  items: z.array(estimateItemSchema).min(1, 'At least one item is required'),
});

type EstimateFormData = z.infer<typeof estimateSchema>;

export default function EstimateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: projectsData } = useProjects();
  const { data: estimateData } = useEstimate(id || '');
  const createEstimate = useCreateEstimate();
  const updateEstimate = useUpdateEstimate();

  type UIItem = { description: string; type: 'Material' | 'Labour' | 'Equipment' | 'Overhead'; unit: string; qty: string; rate: string };
  const [items, setItems] = useState<UIItem[]>([
    { description: '', type: 'Material', unit: '', qty: '', rate: '' },
  ]);

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      projectId: '',
      version: '1',
      description: '',
      items: items,
    },
  });

  useEffect(() => {
    if (estimateData && isEdit) {
      form.reset({
        projectId: (estimateData.projectId && (estimateData.projectId._id || estimateData.projectId.id || estimateData.projectId)) || '',
        version: estimateData.version?.toString() || '1',
        description: estimateData.description || '',
      });
      if (estimateData.items && estimateData.items.length > 0) {
        setItems(estimateData.items.map((item: any) => ({
          description: item.description,
          type: item.type,
          unit: item.uom,
          qty: item.qty.toString(),
          rate: item.rate.toString(),
        })));
      }
    }
  }, [estimateData, isEdit, form]);

  const onSubmit = async (data: EstimateFormData) => {
    try {
      const estimateItems = items.map((item) => ({
        description: item.description,
        type: item.type || 'Material',
        qty: parseFloat(item.qty),
        uom: item.unit,
        rate: parseFloat(item.rate),
        amount: parseFloat(item.qty) * parseFloat(item.rate),
      }));

      const subtotal = estimateItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.18; // 18% GST

      const estimatePayload = {
        projectId: data.projectId,
        version: parseInt(data.version),
        description: data.description,
        items: estimateItems,
        subtotal,
        tax,
        total: subtotal + tax,
        status: 'Draft',
      };

      if (isEdit && id) {
        await updateEstimate.mutateAsync({ id, data: estimatePayload });
      } else {
        await createEstimate.mutateAsync(estimatePayload);
      }
      navigate('/engineering/estimates');
    } catch (error) {
      console.error('Failed to save estimate:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', type: 'Material', unit: '', qty: '', rate: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const calculateItemAmount = (qty: string, rate: string) => {
    const quantity = parseFloat(qty) || 0;
    const itemRate = parseFloat(rate) || 0;
    return quantity * itemRate;
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + calculateItemAmount(item.qty, item.rate);
    }, 0);
  };

  const projects = (projectsData?.data || []) as any[];
  const units = ['SQM', 'CUM', 'RMT', 'NOS', 'KG', 'TON', 'BAG', 'LTR'];
  const itemTypes = ['Material', 'Labour', 'Equipment', 'Overhead'] as const;

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
          <Card>
            <CardHeader>
              <CardTitle>Estimate Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={projects.map((project: any) => ({
                            value: project._id || project.id,
                            label: `${project.code} - ${project.name}`
                          }))}
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
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="v1.0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Estimate notes..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Estimate Items</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
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
                    <div className="col-span-2">
                      <Input
                        placeholder="Description *"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].description = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </div>

                    <Select
                      value={item.type}
                      onValueChange={(value) => {
                        const newItems = [...items];
                        newItems[index].type = value as 'Material' | 'Labour' | 'Equipment' | 'Overhead';
                        setItems(newItems);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {itemTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={item.unit}
                      onValueChange={(value) => {
                        const newItems = [...items];
                        newItems[index].unit = value;
                        setItems(newItems);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.qty}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].qty = e.target.value;
                        setItems(newItems);
                      }}
                    />

                    <Input
                      type="number"
                      placeholder="Rate (₹)"
                      value={item.rate}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].rate = e.target.value;
                        setItems(newItems);
                      }}
                    />

                    <div className="flex items-center justify-between p-3 bg-muted rounded">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="font-semibold">
                        ₹{calculateItemAmount(item.qty, item.rate).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-end p-4 bg-muted rounded-lg">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Estimate</p>
                  <p className="text-2xl font-bold">
                    ₹{calculateTotal().toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={createEstimate.isPending || updateEstimate.isPending}
            >
              {(createEstimate.isPending || updateEstimate.isPending) && (
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
