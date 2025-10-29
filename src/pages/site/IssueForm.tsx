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
import { useProjects } from '@/lib/hooks/useProjects';
import { useItems, useIssue, useCreateIssue, useUpdateIssue } from '@/lib/hooks/useSite';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SearchableSelect } from '@/components/SearchableSelect';

const issueItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  remarks: z.string().optional(),
});

const issueSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  issuedTo: z.string().min(1, 'Issued to is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  items: z.array(issueItemSchema).min(1, 'At least one item is required'),
});

type IssueFormData = z.infer<typeof issueSchema>;

export default function IssueForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: projects = [] } = useProjects();
  const { data: items = [] } = useItems();
  const { data: existingIssue, isLoading } = useIssue(id);
  const { mutateAsync: createIssue, isPending: isCreating } = useCreateIssue();
  const { mutateAsync: updateIssue, isPending: isUpdating } = useUpdateIssue();
  
  const [issueItems, setIssueItems] = useState<any[]>([
    { itemId: '', qty: 1, remarks: '' },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      issueDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedProjectId = watch('projectId');

  // Helper to normalize select values
  const normalizeSelectValue = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && 'value' in val) return val.value;
    return String(val);
  };

  // Load existing issue in edit mode
  useEffect(() => {
    if (existingIssue && id) {
      setValue('projectId', existingIssue.projectId?._id || existingIssue.projectId);
      setValue('issueDate', existingIssue.issueDate?.split('T')[0]);
      setValue('issuedTo', existingIssue.issuedTo);
      setValue('purpose', existingIssue.purpose);
      if (existingIssue.items?.length) {
        setIssueItems(existingIssue.items);
        setValue('items', existingIssue.items);
      }
    }
  }, [existingIssue, id, setValue]);

  const addItem = () => {
    setIssueItems([...issueItems, { itemId: '', qty: 1, remarks: '' }]);
  };

  const removeItem = (index: number) => {
    if (issueItems.length > 1) {
      setIssueItems(issueItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...issueItems];
    updated[index] = { ...updated[index], [field]: value };
    setIssueItems(updated);
    setValue('items', updated);
  };

  const onSubmit = async (data: IssueFormData) => {
    try {
      if (id) {
        await updateIssue({ id, data });
        toast({ title: 'Issue Updated', description: 'Material issue updated successfully' });
      } else {
        await createIssue(data);
        toast({ title: 'Issue Created', description: 'Material issue created successfully' });
      }
      navigate('/site/issues');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save material issue',
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/site/issues')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Material Issue</h1>
          <p className="text-muted-foreground">Issue materials from stock to project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectId">Project *</Label>
                <SearchableSelect
                  options={projects.map((project: any) => ({
                    value: project._id,
                    label: `${project.name} (${project.code})`,
                  }))}
                  value={normalizeSelectValue(selectedProjectId)}
                  onChange={(raw) => {
                    const value = normalizeSelectValue(raw);
                    setValue('projectId', value);
                  }}
                  placeholder="Search and select project..."
                />
                {errors.projectId && (
                  <p className="text-sm text-destructive">{errors.projectId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date *</Label>
                <Input type="date" {...register('issueDate')} />
                {errors.issueDate && (
                  <p className="text-sm text-destructive">{errors.issueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuedTo">Issued To *</Label>
                <Input
                  {...register('issuedTo')}
                  placeholder="Contractor name or person"
                />
                {errors.issuedTo && (
                  <p className="text-sm text-destructive">{errors.issuedTo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose *</Label>
                <Input
                  {...register('purpose')}
                  placeholder="e.g., Civil work, Plumbing work"
                />
                {errors.purpose && (
                  <p className="text-sm text-destructive">{errors.purpose.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Items to Issue</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {issueItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  {issueItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Item *</Label>
                    <SearchableSelect
                      options={items.map((item: any) => ({
                        value: item._id,
                        label: `${item.name} (${item.code})`,
                      }))}
                      value={normalizeSelectValue(item.itemId)}
                      onChange={(raw) => {
                        const value = normalizeSelectValue(raw);
                        updateItem(index, 'itemId', value);
                      }}
                      placeholder="Search and select item..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)}
                      min="1"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Remarks</Label>
                    <Input
                      value={item.remarks}
                      onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/site/issues')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {id ? 'Update' : 'Create'} Issue
          </Button>
        </div>
      </form>
    </div>
  );
}
