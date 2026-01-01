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
import { ArrowLeft, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGRN, useCreateGRN, useUpdateGRN } from '@/lib/hooks/useSite';
import { usePOs } from '@/lib/hooks/usePurchase';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Alert, AlertDescription } from '@/components/ui/alert';

const grnItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  itemName: z.string().optional(),
  orderedQty: z.number().min(0),
  receivedQty: z.number().min(1, 'Received quantity must be at least 1'),
  acceptedQty: z.number().min(0),
  rejectedQty: z.number().min(0),
  uom: z.string().optional(),
  remarks: z.string().optional(),
});

const grnSchema = z.object({
  poId: z.string().min(1, 'Purchase order is required'),
  grnDate: z.string().min(1, 'GRN date is required'),
  invoiceNo: z.string().optional(),
  vehicleNo: z.string().optional(),
  driverName: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(grnItemSchema).min(1, 'At least one item is required'),
}).refine((data) => {
  const today = new Date().toISOString().split('T')[0];
  return data.grnDate <= today;
}, {
  message: 'GRN date cannot be in the future',
  path: ['grnDate'],
}).refine((data) => {
  return data.items.every(item => 
    Math.abs((item.acceptedQty + item.rejectedQty) - item.receivedQty) < 0.01
  );
}, {
  message: 'Accepted + Rejected quantities must equal Received quantity for all items',
  path: ['items'],
});

type GRNFormData = z.infer<typeof grnSchema>;

export default function GRNForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: allPOs = [] } = usePOs();
  const { data: existingGRN, isLoading } = useGRN(id);
  const { mutateAsync: createGRN, isPending: isCreating } = useCreateGRN();
  const { mutateAsync: updateGRN, isPending: isUpdating } = useUpdateGRN();
  
  // Filter to only APPROVED POs that can receive GRN
  const approvedPOs = allPOs.filter((po: any) => 
    po.status === 'APPROVED' || po.status === 'Approved' || po.status === 'approved'
  );

  const [grnItems, setGrnItems] = useState<any[]>([]);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GRNFormData>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      grnDate: new Date().toISOString().split('T')[0],
      items: [],
    },
  });

  const poId = watch('poId');

  const normalizeSelectValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'value' in val) return val.value;
    return String(val);
  };

  // When PO is selected, load its items
  useEffect(() => {
    if (poId && allPOs.length > 0) {
      const po = allPOs.find((p: any) => (p._id || p.id) === poId);
      setSelectedPO(po);
      if (po?.items?.length && !id) {
        const items = po.items.map((item: any) => ({
          itemId: item.itemId?._id || item.itemId || item._id,
          itemName: item.itemId?.name || item.name || item.itemName,
          orderedQty: item.qty || item.quantity || 0,
          receivedQty: 0,
          acceptedQty: 0,
          rejectedQty: 0,
          uom: item.uom || item.itemId?.uom || 'Nos',
          remarks: '',
        }));
        setGrnItems(items);
        setValue('items', items);
      }
    }
  }, [poId, allPOs, id, setValue]);

  // Load existing GRN in edit mode
  useEffect(() => {
    if (existingGRN && id) {
      setValue('poId', existingGRN.poId?._id || existingGRN.poId);
      setValue('grnDate', existingGRN.grnDate?.split('T')[0]);
      setValue('invoiceNo', existingGRN.invoiceNo);
      setValue('vehicleNo', existingGRN.vehicleNo);
      setValue('driverName', existingGRN.driverName);
      setValue('remarks', existingGRN.remarks);
      if (existingGRN.items?.length) {
        setGrnItems(existingGRN.items);
        setValue('items', existingGRN.items);
      }
    }
  }, [existingGRN, id, setValue]);

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...grnItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'receivedQty' || field === 'acceptedQty' || field === 'rejectedQty') {
      const receivedQty = field === 'receivedQty' ? parseFloat(value) : updated[index].receivedQty;
      const acceptedQty = field === 'acceptedQty' ? parseFloat(value) : updated[index].acceptedQty;
      const rejectedQty = field === 'rejectedQty' ? parseFloat(value) : updated[index].rejectedQty;
      
      if (field === 'receivedQty') {
        updated[index].acceptedQty = receivedQty;
        updated[index].rejectedQty = 0;
      } else if (field === 'acceptedQty') {
        updated[index].rejectedQty = Math.max(0, receivedQty - acceptedQty);
      } else if (field === 'rejectedQty') {
        updated[index].acceptedQty = Math.max(0, receivedQty - rejectedQty);
      }
    }
    
    setGrnItems(updated);
    setValue('items', updated);
  };

  const onSubmit = async (data: GRNFormData) => {
    try {
      if (id) {
        await updateGRN({ id, data });
        toast({ title: 'GRN Updated', description: 'Goods Receipt Note updated successfully' });
      } else {
        await createGRN(data);
        toast({ title: 'GRN Created', description: 'Goods Receipt Note created successfully' });
      }
      navigate('/site/grn');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save GRN',
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

  const isLocked = existingGRN?.status === 'Received' || existingGRN?.status === 'RECEIVED' || existingGRN?.status === 'Approved';
  const isSaving = isCreating || isUpdating;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/site/grn')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} GRN</h1>
            {existingGRN?.grnNo && (
              <Badge variant="outline">{existingGRN.grnNo}</Badge>
            )}
            {isLocked && (
              <Badge variant="secondary">🔒 Locked</Badge>
            )}
          </div>
          <p className="text-muted-foreground">Goods Receipt Note for material receiving</p>
        </div>
      </div>

      {isLocked && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This GRN is already received and cannot be modified.
          </AlertDescription>
        </Alert>
      )}

      {approvedPOs.length === 0 && !id && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No approved Purchase Orders available. GRN can only be created against APPROVED POs.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>GRN Details</CardTitle>
            <CardDescription>Select an approved PO to receive materials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poId">Purchase Order (Approved Only) *</Label>
              <SearchableSelect
                options={approvedPOs.map((po: any) => ({
                  value: po._id || po.id,
                  label: `${po.code || po.poNo} - ${po.supplierId?.name || po.supplier?.name || 'Unknown'} (${po.projectId?.name || po.project?.name || 'N/A'})`,
                }))}
                value={normalizeSelectValue(poId)}
                onChange={(raw) => {
                  const value = normalizeSelectValue(raw);
                  setValue('poId', value);
                }}
                placeholder="Search and select approved purchase order..."
                disabled={isLocked || !!id}
              />
              {errors.poId && (
                <p className="text-sm text-destructive">{errors.poId.message}</p>
              )}
            </div>

            {selectedPO && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{selectedPO.supplierId?.name || selectedPO.supplier?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Project</p>
                  <p className="font-medium">{selectedPO.projectId?.name || selectedPO.project?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PO Amount</p>
                  <p className="font-medium">₹{(selectedPO.totalAmount || selectedPO.total || 0).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grnDate">GRN Date *</Label>
                <Input type="date" {...register('grnDate')} disabled={isLocked} />
                {errors.grnDate && (
                  <p className="text-sm text-destructive">{errors.grnDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNo">Supplier Invoice No</Label>
                <Input {...register('invoiceNo')} placeholder="INV-12345" disabled={isLocked} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNo">Vehicle Number</Label>
                <Input {...register('vehicleNo')} placeholder="MH-01-AB-1234" disabled={isLocked} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driverName">Driver Name</Label>
                <Input {...register('driverName')} placeholder="Driver name" disabled={isLocked} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">General Remarks</Label>
              <Textarea
                {...register('remarks')}
                placeholder="Any general observations"
                rows={2}
                disabled={isLocked}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Received Items</CardTitle>
            <CardDescription>
              Items are loaded from the selected PO. Enter received quantities.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {grnItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a Purchase Order to load items
              </div>
            ) : (
              grnItems.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{item.itemName || `Item ${index + 1}`}</h4>
                      <p className="text-sm text-muted-foreground">UOM: {item.uom}</p>
                    </div>
                    <Badge variant="outline">Ordered: {item.orderedQty}</Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Ordered Qty</Label>
                      <Input
                        type="number"
                        value={item.orderedQty}
                        className="bg-muted"
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Received Qty *</Label>
                      <Input
                        type="number"
                        value={item.receivedQty}
                        onChange={(e) => updateItem(index, 'receivedQty', parseFloat(e.target.value) || 0)}
                        min="0"
                        max={item.orderedQty}
                        disabled={isLocked}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Accepted Qty</Label>
                      <Input
                        type="number"
                        value={item.acceptedQty}
                        onChange={(e) => updateItem(index, 'acceptedQty', parseFloat(e.target.value) || 0)}
                        min="0"
                        className="border-green-500/50"
                        disabled={isLocked}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rejected Qty</Label>
                      <Input
                        type="number"
                        value={item.rejectedQty}
                        onChange={(e) => updateItem(index, 'rejectedQty', parseFloat(e.target.value) || 0)}
                        min="0"
                        className="border-destructive/50"
                        disabled={isLocked}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Item Remarks</Label>
                    <Input
                      value={item.remarks}
                      onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                      placeholder="Quality issues, damage, etc."
                      disabled={isLocked}
                    />
                  </div>
                </div>
              ))
            )}
            {errors.items && typeof errors.items.message === 'string' && (
              <p className="text-sm text-destructive">{errors.items.message}</p>
            )}
          </CardContent>
        </Card>

        {!isLocked && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/site/grn')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || grnItems.length === 0}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Update' : 'Create'} GRN
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}