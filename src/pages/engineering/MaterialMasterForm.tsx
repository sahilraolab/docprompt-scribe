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
import { SearchableSelect } from '@/components/SearchableSelect';
import { Switch } from '@/components/ui/switch';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMaterial, useCreateMaterial, useUpdateMaterial } from '@/lib/hooks/useMaterialMaster';

// ✅ Fixed: Schema with safe transformations
const materialSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  uom: z.string().min(1, 'UOM is required'),
  specification: z.string().optional(),
  make: z.string().optional(),
  brand: z.string().optional(),
  hsnCode: z.string().optional(),
  taxRate: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : 18)),
  minStockLevel: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  maxStockLevel: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  reorderLevel: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  standardRate: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
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
      code: null,
      name: '',
      category: '',
      uom: 'Nos',
      taxRate: 18,
      active: true,
    },
  });

  useEffect(() => {
    if (material) {
      form.reset({
        code: material.code || null,
        name: material.name || '',
        description: material.description || '',
        category: material.category || '',
        subCategory: material.subcategory || '',
        uom: material.uom || 'Nos',
        specification: material.specification || '',
        make: (material as any).make || '',
        brand: (material as any).brand || '',
        hsnCode: material.hsnCode || '',
        taxRate: material.taxRate || 18,
        minStockLevel: (material as any).minStockLevel || 0,
        maxStockLevel: (material as any).maxStockLevel || 0,
        reorderLevel: (material as any).reorderLevel || 0,
        standardRate: material.standardRate || 0,
        active: material.active ?? true,
      });
    }
  }, [material, form]);

  const onSubmit = (data: MaterialFormData) => {
    const { subCategory, ...rest } = data;
    const payload = { ...rest, subcategory: subCategory }; // ✅ backend expects `subcategory`

    if (isEdit) {
      updateMaterial.mutate(
        { id: id!, data: payload },
        { onSuccess: () => navigate('/engineering/materials') }
      );
    } else {
      createMaterial.mutate(payload, {
        onSuccess: () => navigate('/engineering/materials'),
      });
    }
  };

  const categories = [
    'Cement', 'Steel', 'Sand', 'Aggregate', 'Bricks', 'Paint',
    'Electrical', 'Plumbing', 'Hardware', 'Other',
  ];

  const uoms = [
    'Nos', 'Kgs', 'MT', 'Ltr', 'Sqm', 'Cum',
    'Bag', 'Box', 'Bundle', 'Roll', 'Feet', 'Meter',
  ];

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
        {/* 🔹 Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input {...form.register('code')} disabled placeholder="MAT-001" />
            </div>

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input {...form.register('name')} placeholder="Material Name" />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <SearchableSelect
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                value={form.watch('category')}
                onChange={(v) => form.setValue('category', v)}
                placeholder="Select category"
              />
            </div>

            <div>
              <Label htmlFor="subCategory">Sub Category</Label>
              <Input {...form.register('subCategory')} placeholder="Sub category" />
            </div>

            <div>
              <Label htmlFor="uom">UOM *</Label>
              <SearchableSelect
                options={uoms.map((uom) => ({ value: uom, label: uom }))}
                value={form.watch('uom')}
                onChange={(v) => form.setValue('uom', v)}
                placeholder="Select UOM"
              />
            </div>

            <div>
              <Label htmlFor="hsnCode">HSN Code</Label>
              <Input {...form.register('hsnCode')} placeholder="HSN Code" />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea {...form.register('description')} placeholder="Material description" rows={3} />
            </div>
          </div>
        </Card>

        {/* 🔹 Specifications */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Specifications</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="specification">Specification</Label>
              <Textarea {...form.register('specification')} rows={2} />
            </div>

            <div>
              <Label htmlFor="make">Make</Label>
              <Input {...form.register('make')} placeholder="Manufacturer" />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input {...form.register('brand')} placeholder="Brand name" />
            </div>

            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                type="number"
                {...form.register('taxRate', { valueAsNumber: true })}
                placeholder="18"
              />
            </div>
          </div>
        </Card>

        {/* 🔹 Stock & Pricing */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Stock & Pricing</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="minStockLevel">Min Stock Level</Label>
              <Input type="number" {...form.register('minStockLevel', { valueAsNumber: true })} placeholder="Minimum quantity" />
            </div>

            <div>
              <Label htmlFor="maxStockLevel">Max Stock Level</Label>
              <Input type="number" {...form.register('maxStockLevel', { valueAsNumber: true })} placeholder="Maximum quantity" />
            </div>

            <div>
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input type="number" {...form.register('reorderLevel', { valueAsNumber: true })} placeholder="Reorder point" />
            </div>

            <div>
              <Label htmlFor="standardRate">Standard Rate</Label>
              <Input type="number" {...form.register('standardRate', { valueAsNumber: true })} placeholder="Standard price" />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                checked={form.watch('active')}
                onCheckedChange={(checked) => form.setValue('active', checked)}
              />
              <Label>Active</Label>
            </div>
          </div>
        </Card>

        {/* 🔹 Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => navigate('/engineering/materials')}>
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
