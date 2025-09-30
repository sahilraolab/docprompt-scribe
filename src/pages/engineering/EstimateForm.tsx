import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { ArrowLeft, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

const estimateItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
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

  const [items, setItems] = useState([
    { description: '', unit: '', qty: '', rate: '' },
  ]);

  const form = useForm<EstimateFormData>({
    resolver: zodResolver(estimateSchema),
    defaultValues: {
      projectId: '',
      version: 'v1.0',
      description: '',
      items: items,
    },
  });

  const onSubmit = (data: EstimateFormData) => {
    console.log('Estimate data:', data);
    toast.success(isEdit ? 'Estimate updated successfully' : 'Estimate created successfully');
    navigate('/engineering/estimates');
  };

  const addItem = () => {
    setItems([...items, { description: '', unit: '', qty: '', rate: '' }]);
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

  // Mock projects
  const projects = [
    { id: '1', name: 'Green Valley Apartments' },
    { id: '2', name: 'City Mall Extension' },
    { id: '3', name: 'Smart Office Tower' },
  ];

  const units = ['SQM', 'CUM', 'RMT', 'NOS', 'KG', 'TON', 'BAG', 'LTR'];

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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].description = e.target.value;
                          setItems(newItems);
                        }}
                      />
                    </div>

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
            <Button type="submit">
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
