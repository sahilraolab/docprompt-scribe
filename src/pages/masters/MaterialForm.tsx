import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import {
  useMasterMaterials, useCreateMasterMaterial, useUpdateMasterMaterial, useMasterUOMs
} from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { MaterialFormData, Material } from '@/types/masters';

const CATEGORIES = [
  'Cement', 'Steel', 'Sand', 'Aggregate', 'Brick', 'Tile', 'Paint',
  'Electrical', 'Plumbing', 'Hardware', 'Wood', 'Glass', 'Chemical', 'Other'
];

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  code: z.string().min(1, 'Code is required').max(20),
  category: z.string().min(1, 'Category is required'),
  uomId: z.coerce.number().optional(),
  hsnCode: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
});

export default function MaterialForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: materials = [], isLoading } = useMasterMaterials();
  const { data: uoms = [] } = useMasterUOMs();
  const createMaterial = useCreateMasterMaterial();
  const updateMaterial = useUpdateMasterMaterial();

  const existingMaterial = isEdit ? materials.find((m: Material) => m.id === Number(id)) : null;

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      category: '',
      uomId: undefined,
      hsnCode: '',
      description: '',
    },
  });

  useEffect(() => {
    if (existingMaterial) {
      form.reset({
        name: existingMaterial.name,
        code: existingMaterial.code,
        category: existingMaterial.category,
        uomId: existingMaterial.uomId,
        hsnCode: existingMaterial.hsnCode || '',
        description: existingMaterial.description || '',
      });
    }
  }, [existingMaterial, form]);

  const onSubmit = (data: MaterialFormData) => {
    if (isEdit) {
      updateMaterial.mutate(
        { id: Number(id), data },
        { onSuccess: () => navigate('/masters/materials') }
      );
    } else {
      createMaterial.mutate(data, { onSuccess: () => navigate('/masters/materials') });
    }
  };

  if (isEdit && isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Edit Material' : 'New Material'}
        description={isEdit ? 'Update material details' : 'Create a new material'}
        actions={
          <Button variant="outline" onClick={() => navigate('/masters/materials')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Material Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Code *</FormLabel>
                      <FormControl>
                        <Input placeholder="MAT001" {...field} />
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
                      <FormLabel>Material Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Material name" {...field} />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
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
                  name="uomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit of Measure</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v ? Number(v) : undefined)}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select UOM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {uoms.map((uom) => (
                            <SelectItem key={uom.id} value={uom.id.toString()}>
                              {uom.name} ({uom.code})
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
                  name="hsnCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="HSN code" {...field} />
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
                      <Textarea placeholder="Material description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/masters/materials')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMaterial.isPending || updateMaterial.isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update' : 'Create'} Material
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
