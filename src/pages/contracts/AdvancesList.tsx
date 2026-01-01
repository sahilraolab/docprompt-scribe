import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdvances, useContractors, useCreateAdvance } from '@/lib/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, CreditCard, Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function AdvancesList() {
  const navigate = useNavigate();
  const { data: advances = [], isLoading } = useAdvances();
  const { data: contractors = [] } = useContractors();
  const createAdvance = useCreateAdvance();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ contractorId: '', amount: '', remarks: '' });

  const filteredAdvances = advances.filter((adv: any) => {
    const contractorName = adv.contractorId?.name?.toLowerCase() || '';
    return contractorName.includes(searchQuery.toLowerCase());
  });

  const handleSubmit = () => {
    if (!formData.contractorId || !formData.amount) {
      toast.error('Contractor and amount are required');
      return;
    }
    createAdvance.mutate({
      contractorId: formData.contractorId,
      amount: Number(formData.amount),
      paidAt: new Date().toISOString(),
      remarks: formData.remarks,
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ contractorId: '', amount: '', remarks: '' });
        toast.success('Advance created successfully');
      },
      onError: () => toast.error('Failed to create advance'),
    });
  };

  const contractorOptions = contractors.map((c: any) => ({
    value: c._id,
    label: c.name,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advances</h1>
          <p className="text-muted-foreground">Manage contractor advance payments</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Advance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by contractor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredAdvances.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvances.map((adv: any) => (
                  <TableRow key={adv._id}>
                    <TableCell className="font-medium">{adv.contractorId?.name || 'N/A'}</TableCell>
                    <TableCell>{adv.woCode || 'General'}</TableCell>
                    <TableCell>{formatDate(adv.paidAt)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(adv.amount)}</TableCell>
                    <TableCell>{formatCurrency(adv.balance || 0)}</TableCell>
                    <TableCell><StatusBadge status={adv.status || 'Paid'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No advances found"
              description="Create advance payments for contractors"
              action={{ label: 'Add Advance', onClick: () => setShowForm(true) }}
            />
          )}
        </CardContent>
      </Card>

      {/* New Advance Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Advance Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Contractor *</Label>
              <SearchableSelect
                options={contractorOptions}
                value={formData.contractorId}
                onChange={(val) => setFormData({ ...formData, contractorId: val })}
                placeholder="Select contractor..."
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createAdvance.isPending}>
              {createAdvance.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Create Advance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
