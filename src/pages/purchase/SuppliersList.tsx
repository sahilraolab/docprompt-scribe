import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliers } from '@/lib/hooks/usePurchaseBackend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { Plus, Search, Building, Loader2, Star, Download } from 'lucide-react';
import { downloadCSV, prepareDataForExport } from '@/lib/utils/export-enhanced';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function SuppliersList() {
  const navigate = useNavigate();
  const { data: suppliers, isLoading } = useSuppliers();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = suppliers?.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.gst?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (!filteredSuppliers || filteredSuppliers.length === 0) return;

    const exportData = prepareDataForExport(filteredSuppliers);
    downloadCSV(
      exportData,
      `suppliers-${new Date().toISOString().split('T')[0]}`,
      ['name', 'contact', 'phone', 'email', 'gst', 'city', 'state', 'rating']
    );
  };

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
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage supplier database</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!filteredSuppliers || filteredSuppliers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/purchase/suppliers/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Supplier
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, or GST..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredSuppliers && filteredSuppliers.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow
                      key={supplier._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/purchase/suppliers/${supplier._id}`)}
                    >
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contact}</TableCell>
                      <TableCell>{supplier.phone || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-sm">{supplier.gst || 'N/A'}</TableCell>
                      <TableCell>{supplier.city}, {supplier.state}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{supplier.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={supplier.active ? 'default' : 'secondary'}>
                          {supplier.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Building}
              title="No suppliers found"
              description={
                searchQuery
                  ? "No suppliers match your search criteria"
                  : "Add suppliers to manage your supply chain"
              }
              action={
                !searchQuery
                  ? {
                    label: "Add Supplier",
                    onClick: () => navigate('/purchase/suppliers/new'),
                  }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
