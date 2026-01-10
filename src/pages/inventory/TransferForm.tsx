/**
 * Stock Transfer Form Page
 * Aligned with backend: POST /inventory/transfer
 * 
 * Request body:
 * {
 *   projectId: number,
 *   fromLocationId: number,
 *   toLocationId: number,
 *   lines: [{ materialId, transferQty }]
 * }
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Plus, Trash2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransfer, useCreateTransfer, useStock } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { SearchableSelect } from '@/components/SearchableSelect';

const transferLineSchema = z.object({
  materialId: z.number({ required_error: 'Material is required' }),
  materialName: z.string().optional(),
  uom: z.string().optional(),
  availableQty: z.number().optional(),
  transferQty: z.number().min(1, 'Quantity must be at least 1'),
  remarks: z.string().optional(),
});

const transferSchema = z.object({
  projectId: z.number({ required_error: 'Project is required' }),
  fromLocationId: z.number({ required_error: 'From location is required' }),
  toLocationId: z.number({ required_error: 'To location is required' }),
  vehicleNo: z.string().optional(),
  driverName: z.string().optional(),
  remarks: z.string().optional(),
  lines: z.array(transferLineSchema).min(1, 'At least one line is required'),
}).refine(data => data.fromLocationId !== data.toLocationId, {
  message: 'From and To locations must be different',
  path: ['toLocationId'],
});

type TransferFormData = z.infer<typeof transferSchema>;

export default function TransferForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: projects = [] } = useProjects();
  const { data: existingTransfer, isLoading: loadingTransfer } = useTransfer(id);
  const { mutateAsync: createTransfer, isPending: isCreating } = useCreateTransfer();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [fromLocationId, setFromLocationId] = useState<number | null>(null);
  const [toLocationId, setToLocationId] = useState<number | null>(null);
  const [transferLines, setTransferLines] = useState<any[]>([
    { materialId: 0, materialName: '', transferQty: 1, remarks: '' },
  ]);

  // Fetch stock from source location
  const { data: stock = [] } = useStock(
    selectedProjectId && fromLocationId
      ? { projectId: selectedProjectId, locationId: fromLocationId }
      : undefined,
    { enabled: !!selectedProjectId && !!fromLocationId }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      lines: [],
    },
  });

  // Load existing transfer in view mode
  useEffect(() => {
    if (existingTransfer && id) {
      setSelectedProjectId(existingTransfer.projectId);
      setFromLocationId(existingTransfer.fromLocationId);
      setToLocationId(existingTransfer.toLocationId);
      setValue('projectId', existingTransfer.projectId);
      setValue('fromLocationId', existingTransfer.fromLocationId);
      setValue('toLocationId', existingTransfer.toLocationId);
      setValue('vehicleNo', existingTransfer.vehicleNo);
      setValue('driverName', existingTransfer.driverName);
      setValue('remarks', existingTransfer.remarks);
      if (existingTransfer.lines?.length) {
        setTransferLines(existingTransfer.lines);
        setValue('lines', existingTransfer.lines);
      }
    }
  }, [existingTransfer, id, setValue]);

  const addLine = () => {
    setTransferLines([...transferLines, { materialId: 0, materialName: '', transferQty: 1, remarks: '' }]);
  };

  const removeLine = (index: number) => {
    if (transferLines.length > 1) {
      const updated = transferLines.filter((_, i) => i !== index);
      setTransferLines(updated);
      setValue('lines', updated);
    }
  };

  const updateLine = (index: number, field: string, value: any) => {
    const updated = [...transferLines];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'materialId' && value) {
      const stockItem = stock.find((s: any) => s.materialId === value);
      if (stockItem) {
        updated[index].availableQty = stockItem.quantity;
        updated[index].materialName = stockItem.materialName;
        updated[index].uom = stockItem.uom;
      }
    }

    setTransferLines(updated);
    setValue('lines', updated);
  };

  const onSubmit = async (data: TransferFormData) => {
    // Validate stock availability
    for (const line of data.lines) {
      const stockItem = stock.find((s: any) => s.materialId === line.materialId);
      if (stockItem && line.transferQty > stockItem.quantity) {
        toast({
          title: 'Insufficient Stock',
          description: `Cannot transfer more than available for ${line.materialName}`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      await createTransfer({
        projectId: data.projectId,
        fromLocationId: data.fromLocationId,
        toLocationId: data.toLocationId,
        vehicleNo: data.vehicleNo,
        driverName: data.driverName,
        remarks: data.remarks,
        lines: data.lines.map(line => ({
          materialId: line.materialId,
          transferQty: line.transferQty,
          remarks: line.remarks,
        })),
      });
      toast({ title: 'Transfer Created', description: 'Stock transfer completed atomically' });
      navigate('/inventory/transfers');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create stock transfer',
        variant: 'destructive',
      });
    }
  };

  if (loadingTransfer && id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isViewMode = !!id;

  const materialOptions = stock.map((s: any) => ({
    value: s.materialId,
    label: `${s.materialName || s.materialCode} (Avail: ${s.quantity} ${s.uom || ''})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/transfers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{isViewMode ? 'View' : 'New'} Stock Transfer</h1>
            {existingTransfer?.transferNo && (
              <Badge variant="outline">{existingTransfer.transferNo}</Badge>
            )}
            {existingTransfer?.status && (
              <Badge variant={existingTransfer.status === 'COMPLETED' ? 'default' : 'secondary'}>
                {existingTransfer.status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Transfer stock between locations (atomic operation)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>Specify source and destination locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                <SearchableSelect
                  options={projects.map((p: any) => ({
                    value: p.id || p._id,
                    label: `${p.name} (${p.code || 'N/A'})`,
                  }))}
                  value={selectedProjectId?.toString() || ''}
                  onChange={(val) => {
                    const numVal = val ? Number(val) : null;
                    setSelectedProjectId(numVal);
                    if (numVal) setValue('projectId', numVal);
                  }}
                  placeholder="Select project..."
                  disabled={isViewMode}
                />
                {errors.projectId && (
                  <p className="text-sm text-destructive">{errors.projectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>From Location *</Label>
                <Input
                  type="number"
                  value={fromLocationId || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setFromLocationId(val);
                    if (val) setValue('fromLocationId', val);
                  }}
                  placeholder="Source location ID"
                  disabled={isViewMode}
                />
                {errors.fromLocationId && (
                  <p className="text-sm text-destructive">{errors.fromLocationId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>To Location *</Label>
                <div className="flex items-center gap-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={toLocationId || ''}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setToLocationId(val);
                      if (val) setValue('toLocationId', val);
                    }}
                    placeholder="Destination location ID"
                    disabled={isViewMode}
                    className="flex-1"
                  />
                </div>
                {errors.toLocationId && (
                  <p className="text-sm text-destructive">{errors.toLocationId.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle No</Label>
                <Input
                  {...register('vehicleNo')}
                  placeholder="MH-01-AB-1234"
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label>Driver Name</Label>
                <Input
                  {...register('driverName')}
                  placeholder="Driver name"
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remarks</Label>
              <Textarea
                {...register('remarks')}
                placeholder="Reason for transfer, conditions, etc."
                rows={2}
                disabled={isViewMode}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transfer Lines</CardTitle>
                <CardDescription>Select materials and quantities to transfer</CardDescription>
              </div>
              {!isViewMode && (
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedProjectId || !fromLocationId ? (
              <div className="text-center py-8 text-muted-foreground">
                Select project and source location to load available materials
              </div>
            ) : (
              transferLines.map((line, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Line {index + 1}</h4>
                    {!isViewMode && transferLines.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeLine(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Material *</Label>
                      <SearchableSelect
                        options={materialOptions}
                        value={line.materialId?.toString() || ''}
                        onChange={(val) => updateLine(index, 'materialId', val ? Number(val) : 0)}
                        placeholder="Select material..."
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Transfer Qty *</Label>
                      <Input
                        type="number"
                        value={line.transferQty}
                        onChange={(e) => updateLine(index, 'transferQty', parseFloat(e.target.value) || 0)}
                        min="1"
                        max={line.availableQty || undefined}
                        disabled={isViewMode}
                      />
                      {line.availableQty !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          Available: {line.availableQty} {line.uom}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Remarks</Label>
                      <Input
                        value={line.remarks || ''}
                        onChange={(e) => updateLine(index, 'remarks', e.target.value)}
                        placeholder="Optional notes"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {!isViewMode && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/inventory/transfers')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || transferLines.length === 0}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Transfer
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
