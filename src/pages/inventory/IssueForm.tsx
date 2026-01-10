/**
 * Material Issue Form Page
 * Aligned with backend: POST /inventory/issue
 * 
 * Request body:
 * {
 *   projectId: number,
 *   fromLocationId: number,
 *   purpose: string,
 *   lines: [{ materialId, issuedQty }]
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
import { ArrowLeft, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIssue, useCreateIssue, useStock } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { SearchableSelect } from '@/components/SearchableSelect';

const issueLineSchema = z.object({
  materialId: z.number({ required_error: 'Material is required' }),
  materialName: z.string().optional(),
  uom: z.string().optional(),
  availableQty: z.number().optional(),
  issuedQty: z.number().min(1, 'Quantity must be at least 1'),
  remarks: z.string().optional(),
});

const issueSchema = z.object({
  projectId: z.number({ required_error: 'Project is required' }),
  fromLocationId: z.number({ required_error: 'Location is required' }),
  purpose: z.string().min(1, 'Purpose is required'),
  issuedTo: z.string().optional(),
  lines: z.array(issueLineSchema).min(1, 'At least one line is required'),
});

type IssueFormData = z.infer<typeof issueSchema>;

export default function IssueForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: projects = [] } = useProjects();
  const { data: existingIssue, isLoading: loadingIssue } = useIssue(id);
  const { mutateAsync: createIssue, isPending: isCreating } = useCreateIssue();

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [issueLines, setIssueLines] = useState<any[]>([
    { materialId: 0, materialName: '', issuedQty: 1, remarks: '' },
  ]);

  // Fetch stock for selected project/location to show available qty
  const { data: stock = [] } = useStock(
    selectedProjectId && selectedLocationId
      ? { projectId: selectedProjectId, locationId: selectedLocationId }
      : undefined,
    { enabled: !!selectedProjectId && !!selectedLocationId }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      lines: [],
    },
  });

  // Load existing issue in view mode
  useEffect(() => {
    if (existingIssue && id) {
      setSelectedProjectId(existingIssue.projectId);
      setSelectedLocationId(existingIssue.fromLocationId);
      setValue('projectId', existingIssue.projectId);
      setValue('fromLocationId', existingIssue.fromLocationId);
      setValue('purpose', existingIssue.purpose);
      setValue('issuedTo', existingIssue.issuedTo);
      if (existingIssue.lines?.length) {
        setIssueLines(existingIssue.lines);
        setValue('lines', existingIssue.lines);
      }
    }
  }, [existingIssue, id, setValue]);

  const addLine = () => {
    setIssueLines([...issueLines, { materialId: 0, materialName: '', issuedQty: 1, remarks: '' }]);
  };

  const removeLine = (index: number) => {
    if (issueLines.length > 1) {
      const updated = issueLines.filter((_, i) => i !== index);
      setIssueLines(updated);
      setValue('lines', updated);
    }
  };

  const updateLine = (index: number, field: string, value: any) => {
    const updated = [...issueLines];
    updated[index] = { ...updated[index], [field]: value };

    // If material is selected, find available qty from stock
    if (field === 'materialId' && value) {
      const stockItem = stock.find((s: any) => s.materialId === value);
      if (stockItem) {
        updated[index].availableQty = stockItem.quantity;
        updated[index].materialName = stockItem.materialName;
        updated[index].uom = stockItem.uom;
      }
    }

    setIssueLines(updated);
    setValue('lines', updated);
  };

  const onSubmit = async (data: IssueFormData) => {
    // Validate no negative stock
    for (const line of data.lines) {
      const stockItem = stock.find((s: any) => s.materialId === line.materialId);
      if (stockItem && line.issuedQty > stockItem.quantity) {
        toast({
          title: 'Insufficient Stock',
          description: `Cannot issue more than available quantity for ${line.materialName}`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      await createIssue({
        projectId: data.projectId,
        fromLocationId: data.fromLocationId,
        purpose: data.purpose,
        issuedTo: data.issuedTo,
        lines: data.lines.map(line => ({
          materialId: line.materialId,
          issuedQty: line.issuedQty,
          remarks: line.remarks,
        })),
      });
      toast({ title: 'Issue Created', description: 'Material issue created and stock updated' });
      navigate('/inventory/issues');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create material issue',
        variant: 'destructive',
      });
    }
  };

  if (loadingIssue && id) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isViewMode = !!id;
  const isLocked = existingIssue?.status === 'APPROVED' || existingIssue?.status === 'CANCELLED';

  // Build material options from stock
  const materialOptions = stock.map((s: any) => ({
    value: s.materialId,
    label: `${s.materialName || s.materialCode} (Avail: ${s.quantity} ${s.uom || ''})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory/issues')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{isViewMode ? 'View' : 'New'} Material Issue</h1>
            {existingIssue?.issueNo && (
              <Badge variant="outline">{existingIssue.issueNo}</Badge>
            )}
            {existingIssue?.status && (
              <Badge variant={
                existingIssue.status === 'APPROVED' ? 'default' :
                existingIssue.status === 'CANCELLED' ? 'destructive' : 'secondary'
              }>
                {existingIssue.status}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Issue materials from stock for site consumption</p>
        </div>
      </div>

      {isLocked && (
        <Alert variant={existingIssue?.status === 'CANCELLED' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {existingIssue?.status === 'CANCELLED'
              ? 'This issue has been cancelled. Stock has been reversed.'
              : 'This issue is approved and cannot be modified.'}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
            <CardDescription>Specify where to issue materials from</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={selectedLocationId || ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setSelectedLocationId(val);
                    if (val) setValue('fromLocationId', val);
                  }}
                  placeholder="Enter location ID"
                  disabled={isViewMode}
                />
                {errors.fromLocationId && (
                  <p className="text-sm text-destructive">{errors.fromLocationId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Purpose *</Label>
                <Textarea
                  {...register('purpose')}
                  placeholder="e.g., Civil work at Block A"
                  rows={2}
                  disabled={isViewMode}
                />
                {errors.purpose && (
                  <p className="text-sm text-destructive">{errors.purpose.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Issued To</Label>
                <Input
                  {...register('issuedTo')}
                  placeholder="Contractor name or person"
                  disabled={isViewMode}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Issue Lines</CardTitle>
                <CardDescription>Select materials and quantities to issue</CardDescription>
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
            {!selectedProjectId || !selectedLocationId ? (
              <div className="text-center py-8 text-muted-foreground">
                Select project and location to load available materials
              </div>
            ) : (
              issueLines.map((line, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Line {index + 1}</h4>
                    {!isViewMode && issueLines.length > 1 && (
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
                      <Label>Issue Qty *</Label>
                      <Input
                        type="number"
                        value={line.issuedQty}
                        onChange={(e) => updateLine(index, 'issuedQty', parseFloat(e.target.value) || 0)}
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
            <Button type="button" variant="outline" onClick={() => navigate('/inventory/issues')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || issueLines.length === 0}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Issue
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
