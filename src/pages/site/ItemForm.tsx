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
import { SearchableSelect } from '@/components/SearchableSelect';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const itemSchema = z.object({
  code: z.string().min(1, 'Item code is required'),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  description: z.string().optional(),
  reorderLevel: z.string().optional(),
  minStock: z.string().optional(),
  maxStock: z.string().optional(),
  hsnCode: z.string().optional(),
  taxRate: z.string().optional(),
  active: z.boolean().default(true),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      code: '',
      name: '',
      category: '',
      unit: '',
      description: '',
      reorderLevel: '',
      minStock: '',
      maxStock: '',
      hsnCode: '',
      taxRate: '18',
      active: true,
    },
  });

  const onSubmit = (data: ItemFormData) => {
    console.log('Item data:', data);
    toast.success(isEdit ? 'Item updated successfully' : 'Item created successfully');
    navigate('/site/items');
  };

  const categories = [
    'Cement & Concrete',
    'Steel & Metal',
    'Bricks & Blocks',
    'Sand & Aggregates',
    'Tiles & Flooring',
    'Paints & Chemicals',
    'Electrical',
    'Plumbing',
    'Hardware',
    'Wood & Timber',
    'Glass & Glazing',
    'Other',
  ];

  const units = ['BAG', 'TON', 'KG', 'LTR', 'CUM', 'SQM', 'RMT', 'NOS', 'BOX', 'BUNDLE'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/site/items')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEdit ? 'Edit' : 'New'} Item</h1>
          <p className="text-muted-foreground">Manage material item master</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Code *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ITEM-001" />
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
                      <FormLabel>Item Name *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Cement OPC 53 Grade" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={categories.map(cat => ({ value: cat, label: cat }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={units.map(unit => ({ value: unit, label: unit }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select unit"
                        />
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
                      <Textarea {...field} placeholder="Item specifications and details..." rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this item for transactions
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="reorderLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reorder Level</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Stock</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Stock</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="500" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hsnCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="25232930" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="18" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit">
              {isEdit ? 'Update Item' : 'Create Item'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/site/items')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
