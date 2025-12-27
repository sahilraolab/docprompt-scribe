import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Plus, Search, Edit2, Trash2, Percent } from 'lucide-react';
import { useMasterTaxes, useDeleteMasterTax } from '@/lib/hooks/useMasters';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import type { Tax } from '@/types/masters';

export default function TaxesList() {
  const navigate = useNavigate();
  const { data: taxes = [], isLoading } = useMasterTaxes();
  const deleteTax = useDeleteMasterTax();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = taxes.filter((t: Tax) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteId) {
      deleteTax.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Taxes"
        description="Manage tax rates and configurations"
        actions={[
          { label: 'Add Tax', onClick: () => navigate('/masters/taxes/new'), icon: Plus }
        ]}
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search taxes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Percent}
              title="No taxes found"
              description="Create your first tax configuration"
              action={{ label: 'Add Tax', onClick: () => navigate('/masters/taxes/new') }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tax: Tax) => (
                  <TableRow key={tax.id}>
                    <TableCell className="font-mono text-sm">{tax.code}</TableCell>
                    <TableCell className="font-medium">{tax.name}</TableCell>
                    <TableCell>{tax.rate}%</TableCell>
                    <TableCell>{tax.type || 'GST'}</TableCell>
                    <TableCell>
                      <Badge variant={tax.isActive ? 'default' : 'secondary'}>
                        {tax.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/masters/taxes/${tax.id}/edit`)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(tax.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
