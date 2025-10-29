import { useEffect } from 'react';
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
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { siteApi } from '@/lib/api/siteApi';
// import { useItemById } from '@/lib/hooks/useSite'; // we'll use this to fetch item for edit
import { useItem } from "@/lib/hooks/useSite";

// ✅ Schema for validation
const itemSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, 'Item name is required'),
  category: z.string().min(1, 'Category is required'),
  uom: z.string().min(1, 'Unit is required'),
  description: z.string().optional(),
  reorderLevel: z.coerce.number().optional(),
  minStock: z.coerce.number().optional(),
  maxStock: z.coerce.number().optional(),
  hsnCode: z.string().optional(),
  taxRate: z.coerce.number().optional(),
  active: z.boolean().default(true),
});

type ItemFormData = z.infer<typeof itemSchema>;

export default function ItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: item, isLoading } = useItem(id || '');

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      code: '',
      name: '',
      category: '',
      uom: '',
      description: '',
      reorderLevel: 0,
      minStock: 0,
      maxStock: 0,
      hsnCode: '',
      taxRate: 18,
      active: true,
    },
  });

  // ✅ Load data if editing
  useEffect(() => {
    if (item) {
      form.reset({
        code: item.code || '',
        name: item.name || '',
        category: item.category || '',
        uom: item.uom || '',
        description: item.description || '',
        reorderLevel: item.reorderLevel || 0,
        minStock: item.minStock || 0,
        maxStock: item.maxStock || 0,
        hsnCode: item.hsnCode || '',
        taxRate: item.taxRate || 18,
        active: item.active ?? true,
      });
    }
  }, [item]);

  const onSubmit = async (data: ItemFormData) => {
    try {
      if (isEdit && id) {
        await siteApi.updateItem(id, data);
        toast.success('Item updated successfully');
      } else {
        await siteApi.createItem(data);
        toast.success('Item created successfully');
      }
      navigate('/site/items');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong');
    }
  };

  const categories = [
    'Material',
    'Equipment',
    'Consumable',
    'Tool',
  ];

  const uoms = ['BAG', 'TON', 'KG', 'LTR', 'CUM', 'SQM', 'RMT', 'NOS', 'BOX', 'BUNDLE'];

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          {/* ---------- ITEM INFORMATION ---------- */}
          <Card>
            <CardHeader>
              <CardTitle>Item Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* ✅ Auto-generated Code (Disabled) */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Code (Auto-generated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Auto-generated" disabled />
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
                          options={categories.map(c => ({ value: c, label: c }))}
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
                  name="uom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure *</FormLabel>
                      <FormControl>
                        <SearchableSelect
                          options={uoms.map(u => ({ value: u, label: u }))}
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
                    <div>
                      <FormLabel>Active Status</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Enable this item for transactions
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ---------- STOCK MANAGEMENT ---------- */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              {['reorderLevel', 'minStock', 'maxStock'].map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof ItemFormData}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{name === 'reorderLevel' ? 'Reorder Level' : name === 'minStock' ? 'Min Stock' : 'Max Stock'}</FormLabel>
                       <FormControl>
                         <Input 
                           type="number" 
                           value={field.value as number || 0}
                           onChange={e => field.onChange(Number(e.target.value))}
                           onBlur={field.onBlur}
                           disabled={field.disabled}
                           name={field.name}
                         />
                       </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          {/* ---------- TAX INFORMATION ---------- */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
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
