import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const approvalLevelSchema = z.object({
  level: z.number().min(1),
  role: z.string().min(1, 'Role is required'),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
});

const workflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  module: z.enum(['Purchase', 'Contracts', 'Accounts', 'Site']),
  documentType: z.string().min(1, 'Document type is required'),
  description: z.string().optional(),
  active: z.boolean(),
  levels: z.array(approvalLevelSchema).min(1, 'At least one approval level is required'),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

export default function WorkflowConfigForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [approvalLevels, setApprovalLevels] = useState<any[]>([
    { level: 1, role: '', minAmount: 0, maxAmount: 0 },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      active: true,
    },
  });

  const module = watch('module');
  const active = watch('active');

  const addLevel = () => {
    const nextLevel = approvalLevels.length + 1;
    setApprovalLevels([...approvalLevels, { level: nextLevel, role: '', minAmount: 0, maxAmount: 0 }]);
  };

  const removeLevel = (index: number) => {
    if (approvalLevels.length > 1) {
      setApprovalLevels(approvalLevels.filter((_, i) => i !== index));
    }
  };

  const updateLevel = (index: number, field: string, value: any) => {
    const updated = [...approvalLevels];
    updated[index] = { ...updated[index], [field]: value };
    setApprovalLevels(updated);
    setValue('levels', updated);
  };

  const onSubmit = (data: WorkflowFormData) => {
    console.log('Workflow Data:', data);
    toast({
      title: id ? 'Workflow Updated' : 'Workflow Created',
      description: `Approval workflow has been ${id ? 'updated' : 'created'} successfully.`,
    });
    navigate('/workflow/config');
  };

  const roles = [
    'Admin',
    'ProjectManager',
    'PurchaseOfficer',
    'SiteEngineer',
    'Accountant',
    'Approver',
  ];

  const documentTypesByModule: Record<string, string[]> = {
    Purchase: ['Material Requisition', 'Purchase Order', 'Quotation', 'Purchase Bill'],
    Contracts: ['Work Order', 'RA Bill', 'Contractor'],
    Accounts: ['Journal Entry', 'Payment', 'Receipt'],
    Site: ['GRN', 'Material Issue', 'Transfer'],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/workflow/config')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Workflow</h1>
          <p className="text-muted-foreground">Configure approval workflow and levels</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name *</Label>
              <Input {...register('name')} placeholder="Purchase Order Approval" />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="module">Module *</Label>
                <Select
                  value={module}
                  onValueChange={(value) => setValue('module', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase">Purchase</SelectItem>
                    <SelectItem value="Contracts">Contracts</SelectItem>
                    <SelectItem value="Accounts">Accounts</SelectItem>
                    <SelectItem value="Site">Site</SelectItem>
                  </SelectContent>
                </Select>
                {errors.module && (
                  <p className="text-sm text-destructive">{errors.module.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select
                  value={watch('documentType')}
                  onValueChange={(value) => setValue('documentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {module && documentTypesByModule[module]?.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.documentType && (
                  <p className="text-sm text-destructive">{errors.documentType.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                {...register('description')}
                placeholder="Workflow purpose and conditions"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Enable this workflow</p>
              </div>
              <Switch
                checked={active}
                onCheckedChange={(value) => setValue('active', value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Approval Levels</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addLevel}>
                <Plus className="h-4 w-4 mr-2" />
                Add Level
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {approvalLevels.map((level, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Level {index + 1}</h4>
                  {approvalLevels.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLevel(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Approver Role *</Label>
                    <Select
                      value={level.role}
                      onValueChange={(value) => updateLevel(index, 'role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Min Amount (₹)</Label>
                    <Input
                      type="number"
                      value={level.minAmount}
                      onChange={(e) => updateLevel(index, 'minAmount', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Amount (₹)</Label>
                    <Input
                      type="number"
                      value={level.maxAmount}
                      onChange={(e) => updateLevel(index, 'maxAmount', parseFloat(e.target.value) || 0)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/workflow/config')}>
            Cancel
          </Button>
          <Button type="submit">{id ? 'Update' : 'Create'} Workflow</Button>
        </div>
      </form>
    </div>
  );
}
