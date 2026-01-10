/**
 * GRN Form Page
 * Aligned with backend: POST /inventory/grn
 * 
 * Request body:
 * {
 *   projectId: number,
 *   locationId: number,
 *   poId: number,
 *   lines: [{ poLineId, materialId, orderedQty, receivedQty, acceptedQty, rejectedQty }]
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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGRN, useCreateGRN } from '@/lib/hooks/useInventory';
import { usePOs } from '@/lib/hooks/usePurchase';
import { useProjects } from '@/lib/hooks/useProjects';
import { SearchableSelect } from '@/components/SearchableSelect';

const grnLineSchema = z.object({
  poLineId: z.number(),
  materialId: z.number(),
  materialName: z.string().optional(),
  uom: z.string().optional(),
  orderedQty: z.number().min(0),
  receivedQty: z.number().min(0),
  acceptedQty: z.number().min(0),
  rejectedQty: z.number().min(0),
});

const grnSchema = z.object({
  projectId: z.number({ required_error: 'Project is required' }),
  locationId: z.number({ required_error: 'Location is required' }),
  poId: z.number({ required_error: 'Purchase Order is required' }),
  lines: z.array(grnLineSchema).min(1, 'At least one line is required'),
}).refine((data) => {
  return data.lines.every(line =>
    Math.abs((line.acceptedQty + line.rejectedQty) - line.receivedQty) < 0.01
  );
}, {
  message: 'Accepted + Rejected must equal Received for all lines',
  path: ['lines'],
});

type GRNFormData = z.infer<typeof grnSchema>;

export default function GRNForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: projects = [] } = useProjects();
  const { data: existingGRN, isLoading: loadingGRN } = useGRN(id);
  const { mutateAsync: createGRN, isPending: isCreating } = useCreateGRN();
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [grnLines, setGrnLines] = useState<any[]>([]);

  // Fetch POs for selected project
  const { data: allPOs = [] } = usePOs(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );
  
  // Filter to only APPROVED POs
  const approvedPOs = allPOs.filter((po: any) => po.status === 'APPROVED');

  const {
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      lines: [],
    },
  });

  const poId = watch('poId');

  // When PO is selected, load its lines
  useEffect(() => {
    if (poId && approvedPOs.length > 0) {
      const po = approvedPOs.find((p: any) => p.id === poId);
      if (po?.lines?.length) {
        const lines = po.lines.map((line: any) => ({
          poLineId: line.id,
          materialId: line.materialId,
          materialName: line.materialName || line.material?.name,
          uom: line.uom || line.material?.uom,
          orderedQty: line.qty || line.quantity || 0,
          receivedQty: 0,
          acceptedQty: 0,
          rejectedQty: 0,
        }));
        setGrnLines(lines);
        setValue('lines', lines);
      }
    }
  }, [poId, approvedPOs, setValue]);

  // Load existing GRN in view mode
  useEffect(() => {
    if (existingGRN && id) {
      setSelectedProjectId(existingGRN.projectId);
      setSelectedLocationId(existingGRN.locationId);
      setValue('projectId', existingGRN.projectId);
      setValue('locationId', existingGRN.locationId);
      setValue('poId', existingGRN.poId);
      if (existingGRN.lines?.length) {
        setGrnLines(existingGRN.lines);
        setValue('lines', existingGRN.lines);
      }
    }
  }, [existingGRN, id, setValue]);

  const updateLine = (index: number, field: string, value: number) => {
    const updated = [...grnLines];
    updated[index] = { ...updated[index], [field]: value };

    // Auto-calculate accepted/rejected
    if (field === 'receivedQty') {
      updated[index].acceptedQty = value;
      updated[index].rejectedQty = 0;
    } else if (field === 'acceptedQty') {
      updated[index].rejectedQty = Math.max(0, updated[index].receivedQty - value);
    } else if (field === 'rejectedQty') {
      updated[index].acceptedQty = Math.max(0, updated[index].receivedQty - value);
    }

    setGrnLines(updated);
    setValue('lines', updated);
  };

  const onSubmit = async (data: GRNFormData) => {
    try {
      await createGRN({
        projectId: data.projectId,
        locationId: data.locationId,
        poId: data.poId,
        lines: data.lines.map(line => ({
          poLineId: line.poLineId,
          materialId: line.materialId,
          orderedQty: line.orderedQty,
          receivedQty: line.receivedQty,
          acceptedQty: line.acceptedQty,
          rejectedQty: line.rejectedQty,
        })),
      });
      toast({ title: 'GRN Created', description: 'Goods Receipt Note created successfully. Status: QC_PENDING' });
      navigate('/inventory/grn');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create GRN',
        variant: 'destructive',
      });
    }
  };

  if (loadingGRN && id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isViewMode = !!id;
  const isLocked = existingGRN?.status === 'APPROVED' || existingGRN?.status === 'PARTIAL_APPROVED';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/grn')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{isViewMode ? 'View' : 'New'} GRN</h1>
            {existingGRN?.grnNo && (
              <Badge variant="outline">{existingGRN.grnNo}</Badge>
            )}
            {existingGRN?.status && (
              <Badge variant={existingGRN.status === 'APPROVED' ? 'default' : 'secondary'}>
                {existingGRN.status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Receive materials against approved PO</p>
        </div>
      </div>

      {isLocked && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This GRN is approved and cannot be modified.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GRN Details</CardTitle>
            <CardDescription>Select project, location, and PO to receive materials</CardDescription>
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
                <Label>Location *</Label>
                <Input
                  type="number"
                  value={selectedLocationId || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setSelectedLocationId(val);
                    if (val) setValue('locationId', val);
                  }}
                  placeholder="Enter location ID"
                  disabled={isViewMode}
                />
                {errors.locationId && (
                  <p className="text-sm text-destructive">{errors.locationId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Purchase Order (Approved) *</Label>
                <SearchableSelect
                  options={approvedPOs.map((po: any) => ({
                    value: po.id,
                    label: `${po.poNo} - ${po.supplierName || 'Unknown'}`,
                  }))}
                  value={poId?.toString() || ''}
                  onChange={(val) => {
                    if (val) setValue('poId', Number(val));
                  }}
                  placeholder="Select approved PO..."
                  disabled={isViewMode || !selectedProjectId}
                />
                {errors.poId && (
                  <p className="text-sm text-destructive">{errors.poId.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GRN Lines</CardTitle>
            <CardDescription>
              Enter received quantities. Accepted + Rejected must equal Received.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {grnLines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a Purchase Order to load materials
              </div>
            ) : (
              <div className="space-y-4">
                {grnLines.map((line, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{line.materialName || `Material ${line.materialId}`}</h4>
                        <p className="text-sm text-muted-foreground">UOM: {line.uom || 'N/A'}</p>
                      </div>
                      <Badge variant="outline">Ordered: {line.orderedQty}</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Ordered Qty</Label>
                        <Input type="number" value={line.orderedQty} disabled className="bg-muted" />
                      </div>

                      <div className="space-y-2">
                        <Label>Received Qty *</Label>
                        <Input
                          type="number"
                          value={line.receivedQty}
                          onChange={(e) => updateLine(index, 'receivedQty', parseFloat(e.target.value) || 0)}
                          min="0"
                          max={line.orderedQty}
                          disabled={isViewMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Accepted Qty</Label>
                        <Input
                          type="number"
                          value={line.acceptedQty}
                          onChange={(e) => updateLine(index, 'acceptedQty', parseFloat(e.target.value) || 0)}
                          min="0"
                          className="border-green-500/50"
                          disabled={isViewMode}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Rejected Qty</Label>
                        <Input
                          type="number"
                          value={line.rejectedQty}
                          onChange={(e) => updateLine(index, 'rejectedQty', parseFloat(e.target.value) || 0)}
                          min="0"
                          className="border-destructive/50"
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.lines && typeof errors.lines.message === 'string' && (
              <p className="text-sm text-destructive mt-4">{errors.lines.message}</p>
            )}
          </CardContent>
        </Card>

        {!isViewMode && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/inventory/grn')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || grnLines.length === 0}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create GRN
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
