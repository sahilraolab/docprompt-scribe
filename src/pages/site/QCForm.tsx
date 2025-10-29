import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGRNs, useItems, useQC, useCreateQC, useUpdateQC } from '@/lib/hooks/useSite';
import { SearchableSelect } from '@/components/SearchableSelect';

const qcSchema = z.object({
  grnId: z.string().min(1, 'GRN reference is required'),
  itemId: z.string().min(1, 'Item is required'),
  inspectionDate: z.string().min(1, 'Inspection date is required'),
  inspectedBy: z.string().min(1, 'Inspector name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  batchNo: z.string().optional(),
  result: z.enum(['Pass', 'Fail', 'Hold']),
  testResults: z.string().optional(),
  remarks: z.string().optional(),
});

type QCFormData = z.infer<typeof qcSchema>;

export default function QCForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: grns = [] } = useGRNs();
  const { data: items = [] } = useItems();
  const { data: existingQC, isLoading } = useQC(id);
  const { mutateAsync: createQC, isPending: isCreating } = useCreateQC();
  const { mutateAsync: updateQC, isPending: isUpdating } = useUpdateQC();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QCFormData>({
    resolver: zodResolver(qcSchema),
    defaultValues: {
      inspectionDate: new Date().toISOString().split('T')[0],
      result: 'Pass',
    },
  });

  const grnId = watch('grnId');
  const itemId = watch('itemId');
  const result = watch('result');

  // Helper to normalize select values
  const normalizeSelectValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'value' in val) return val.value;
    return String(val);
  };

  // Load existing QC in edit mode
  useEffect(() => {
    if (existingQC && id) {
      setValue('grnId', existingQC.grnId?._id || existingQC.grnId);
      setValue('itemId', existingQC.itemId?._id || existingQC.itemId);
      setValue('inspectionDate', existingQC.inspectionDate?.split('T')[0]);
      setValue('inspectedBy', existingQC.inspectedBy);
      setValue('quantity', existingQC.quantity);
      setValue('unit', existingQC.unit);
      setValue('batchNo', existingQC.batchNo);
      setValue('result', existingQC.result);
      setValue('testResults', existingQC.testResults);
      setValue('remarks', existingQC.remarks);
    }
  }, [existingQC, id, setValue]);

  const onSubmit = async (data: QCFormData) => {
    try {
      if (id) {
        await updateQC({ id, data });
        toast({ title: 'QC Inspection Updated', description: 'QC inspection updated successfully' });
      } else {
        await createQC(data);
        toast({ title: 'QC Inspection Created', description: 'QC inspection created successfully' });
      }
      navigate('/site/qc');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save QC inspection',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/site/qc')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} QC Inspection</h1>
          <p className="text-muted-foreground">Quality control inspection form</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grn">GRN Reference *</Label>
                <SearchableSelect
                  options={grns.map((grn: any) => ({
                    value: grn._id,
                    label: `${grn.grnNo} - ${grn.poId?.supplierId?.name || 'Unknown'}`,
                  }))}
                  value={normalizeSelectValue(grnId)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('grnId', value);
                  }}
                  placeholder="Search and select GRN..."
                />
                {errors.grnId && <p className="text-sm text-destructive">{errors.grnId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">Item *</Label>
                <SearchableSelect
                  options={items.map((item: any) => ({
                    value: item._id,
                    label: `${item.name} (${item.code})`,
                  }))}
                  value={normalizeSelectValue(itemId)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    const selectedItem = items.find((i: any) => i._id === value);
                    setValue('itemId', value);
                    if (selectedItem) {
                      setValue('unit', selectedItem.uom || '');
                    }
                  }}
                  placeholder="Search and select item..."
                />
                {errors.itemId && <p className="text-sm text-destructive">{errors.itemId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectionDate">Inspection Date *</Label>
                <Input type="date" {...register('inspectionDate')} />
                {errors.inspectionDate && (
                  <p className="text-sm text-destructive">{errors.inspectionDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectedBy">Inspector *</Label>
                <Input {...register('inspectedBy')} placeholder="Inspector name" />
                {errors.inspectedBy && (
                  <p className="text-sm text-destructive">{errors.inspectedBy.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Inspected *</Label>
                <Input type="number" {...register('quantity', { valueAsNumber: true })} placeholder="Enter quantity" />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Input {...register('unit')} placeholder="e.g., kg, bags, pcs" />
                {errors.unit && (
                  <p className="text-sm text-destructive">{errors.unit.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNo">Batch Number</Label>
                <Input {...register('batchNo')} placeholder="Enter batch number" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="result">Inspection Result *</Label>
                <SearchableSelect
                  options={[
                    { value: 'Pass', label: 'Pass - Accepted' },
                    { value: 'Fail', label: 'Fail - Rejected' },
                    { value: 'Hold', label: 'Hold - Under Review' },
                  ]}
                  value={normalizeSelectValue(result)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('result', value as any);
                  }}
                  placeholder="Select result..."
                />
                {errors.result && (
                  <p className="text-sm text-destructive">{errors.result.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testResults">Test Results</Label>
              <Textarea 
                {...register('testResults')}
                placeholder="Enter test results and measurements"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea 
                {...register('remarks')}
                placeholder="Enter any remarks or observations"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {id ? 'Update Inspection' : 'Create Inspection'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/site/qc')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
