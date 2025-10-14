import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMaterial, useCreateMaterial, useUpdateMaterial } from '@/lib/hooks/useMaterialMaster';

const materialSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  uom: z.string().min(1, 'UOM is required'),
  specification: z.string().optional(),
  make: z.string().optional(),
  brand: z.string().optional(),
  hsnCode: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  minStockLevel: z.number().min(0).optional(),
  maxStockLevel: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  standardRate: z.number().min(0).optional(),
  active: z.boolean().default(true),
});

type MaterialFormData = z.infer<typeof materialSchema>;

const MaterialMasterForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: material, isLoading } = useMaterial(id || '');
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      code: '',
      name: '',
      category: '',
      uom: 'Nos',
      taxRate: 18,
      active: true,
    },
  });

  useEffect(() => {
    if (material) {
      form.reset(material);
    }
  }, [material, form]);

  const onSubmit = (data: MaterialFormData) => {
    if (isEdit) {
      updateMaterial.mutate({ id: id!, data }, {
        onSuccess: () => navigate('/engineering/materials'),
      });
    } else {
      createMaterial.mutate(data, {
        onSuccess: () => navigate('/engineering/materials'),
      });
    }
  };

  const categories = ['Cement', 'Steel', 'Sand', 'Aggregates', 'Bricks', 'Paint', 'Electrical', 'Plumbing', 'Hardware', 'Other'];
  const uoms = ['Nos', 'Kgs', 'MT', 'Ltr', 'Sqm', 'Cum', 'Bag', 'Box', 'Bundle', 'Roll', 'Feet', 'Meter'];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Material' : 'Add Material'}
        description="Material Master for BOQ and Procurement"
      />

      <Button variant="ghost" onClick={() => navigate('/engineering/materials')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Materials
      </Button>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input {...form.register('code')} placeholder="MAT-001" />
              {form.formState.errors.code && (
                <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input {...form.register('name')} placeholder="Material Name" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={form.watch('category')} onValueChange={(value) => form.setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subCategory">Sub Category</Label>
              <Input {...form.register('subCategory')} placeholder="Sub category" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="uom">UOM *</Label>
              <Select value={form.watch('uom')} onValueChange={(value) => form.setValue('uom', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select UOM" />
                </SelectTrigger>
                <SelectContent>
                  {uoms.map((uom) => (
                    <SelectItem key={uom} value={uom}>{uom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hsnCode">HSN Code</Label>
              <Input {...form.register('hsnCode')} placeholder="HSN Code" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea {...form.register('description')} placeholder="Material description" rows={3} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Specifications</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specification">Specification</Label>
              <Textarea {...form.register('specification')} rows={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input {...form.register('make')} placeholder="Manufacturer" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input {...form.register('brand')} placeholder="Brand name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                type="number"
                {...form.register('taxRate', { valueAsNumber: true })}
                placeholder="18"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Stock & Pricing</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input
                type="number"
                {...form.register('minStockLevel', { valueAsNumber: true })}
                placeholder="Minimum quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxStockLevel">Max Stock Level</Label>
              <Input
                type="number"
                {...form.register('maxStockLevel', { valueAsNumber: true })}
                placeholder="Maximum quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                type="number"
                {...form.register('reorderLevel', { valueAsNumber: true })}
                placeholder="Reorder point"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="standardRate">Standard Rate</Label>
              <Input
                type="number"
                {...form.register('standardRate', { valueAsNumber: true })}
                placeholder="Standard price"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={form.watch('active')}
                onCheckedChange={(checked) => form.setValue('active', checked)}
              />
              <Label>Active</Label>
            </div>
          </div>
        </Card>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate('/engineering/materials')}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMaterial.isPending || updateMaterial.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {isEdit ? 'Update' : 'Create'} Material
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MaterialMasterForm;
