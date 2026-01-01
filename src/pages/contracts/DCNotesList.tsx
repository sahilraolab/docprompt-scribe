import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDCNotes, useContractors, useCreateDCNote } from '@/lib/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Loader2, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function DCNotesList() {
  const navigate = useNavigate();
  const { data: dcNotes = [], isLoading } = useDCNotes();
  const { data: contractors = [] } = useContractors();
  const createDCNote = useCreateDCNote();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    contractorId: '', 
    type: 'Debit' as 'Debit' | 'Credit', 
    amount: '', 
    reason: '' 
  });

  const filteredNotes = dcNotes.filter((note: any) => {
    const contractorName = note.contractorId?.name?.toLowerCase() || '';
    const code = note.code?.toLowerCase() || '';
    return contractorName.includes(searchQuery.toLowerCase()) || code.includes(searchQuery.toLowerCase());
  });

  const handleSubmit = () => {
    if (!formData.contractorId || !formData.amount || !formData.reason) {
      toast.error('All fields are required');
      return;
    }
    createDCNote.mutate({
      contractorId: formData.contractorId,
      type: formData.type,
      amount: Number(formData.amount),
      reason: formData.reason,
      date: new Date().toISOString(),
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ contractorId: '', type: 'Debit', amount: '', reason: '' });
        toast.success(`${formData.type} note created successfully`);
      },
      onError: () => toast.error('Failed to create note'),
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
          <h1 className="text-3xl font-bold">Debit/Credit Notes</h1>
          <p className="text-muted-foreground">Manage adjustments and corrections</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by contractor or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotes.map((note: any) => (
                  <TableRow key={note._id}>
                    <TableCell className="font-medium">{note.code}</TableCell>
                    <TableCell>{note.contractorId?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={note.type === 'Credit' ? 'default' : 'destructive'}>
                        {note.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(note.date)}</TableCell>
                    <TableCell className={`font-medium ${note.type === 'Credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {note.type === 'Credit' ? '+' : '-'}{formatCurrency(note.amount)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{note.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={FileText}
              title="No debit/credit notes found"
              description="Create notes for adjustments and corrections"
              action={{ label: 'Add Note', onClick: () => setShowForm(true) }}
            />
          )}
        </CardContent>
      </Card>

      {/* New DC Note Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Debit/Credit Note</DialogTitle>
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
              <Label>Type *</Label>
              <Select value={formData.type} onValueChange={(val: 'Debit' | 'Credit') => setFormData({ ...formData, type: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Debit">Debit Note (Reduces payable)</SelectItem>
                  <SelectItem value="Credit">Credit Note (Increases payable)</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Reason *</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Reason for this adjustment"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createDCNote.isPending}>
              {createDCNote.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              Create Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
