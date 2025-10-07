import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

export default function SLAForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      toast({
        title: id ? 'SLA updated' : 'SLA created',
        description: 'SLA configuration saved successfully',
      });
      setSaving(false);
      navigate('/workflow/sla');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} SLA</h1>
          <p className="text-muted-foreground">Service level agreement configuration</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/workflow/sla')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>SLA Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">SLA Name *</Label>
                <Input id="name" placeholder="Enter SLA name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="module">Module *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="contracts">Contracts</SelectItem>
                    <SelectItem value="accounts">Accounts</SelectItem>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="site">Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entity">Entity Type *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mr">Material Requisition</SelectItem>
                    <SelectItem value="po">Purchase Order</SelectItem>
                    <SelectItem value="wo">Work Order</SelectItem>
                    <SelectItem value="ra">RA Bill</SelectItem>
                    <SelectItem value="journal">Journal Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetHours">Target Hours *</Label>
                <Input type="number" id="targetHours" placeholder="Enter target hours" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalateRole">Escalate to Role</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalateAfter">Escalate After (hours)</Label>
                <Input type="number" id="escalateAfter" placeholder="Enter escalation hours" />
              </div>

              <div className="flex items-center space-x-2 pt-7">
                <Switch id="active" defaultChecked />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter SLA description"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : id ? 'Update SLA' : 'Create SLA'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/workflow/sla')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
