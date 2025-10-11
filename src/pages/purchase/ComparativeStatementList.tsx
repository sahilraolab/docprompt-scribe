import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComparativeStatement } from '@/types';
import { useComparativeStatements } from '@/lib/hooks/usePurchaseBackend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ComparativeStatementList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('date');

  const { data: statements, isLoading } = useComparativeStatements();

  const filteredStatements = statements
    ?.filter((stmt) =>
      stmt.mrCode?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'mr') return (a.mrCode || '').localeCompare(b.mrCode || '');
      return 0;
    });

  const handleExport = () => {
    if (!filteredStatements) return;
    const data = filteredStatements.map((stmt) => ({
      'MR Code': stmt.mrCode,
      'Quotations': stmt.quotations.length,
      'Selected Supplier': stmt.selectedSupplierId || 'Not selected',
      'Analysis': stmt.analysis,
      'Date': stmt.createdAt,
    }));
    exportData(data, { filename: 'comparative-statements', format: 'csv' });
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
          <h1 className="text-3xl font-bold">Comparative Statements</h1>
          <p className="text-muted-foreground">Compare supplier quotations</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by MR code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="mr">MR Code</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStatements && filteredStatements.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MR Code</TableHead>
                    <TableHead>Quotations</TableHead>
                    <TableHead>Selected Supplier</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatements.map((stmt) => (
                    <TableRow key={stmt.id}>
                      <TableCell className="font-medium">{stmt.mrCode}</TableCell>
                      <TableCell>{stmt.quotations.length} quotes</TableCell>
                      <TableCell>
                        {stmt.selectedSupplierId || (
                          <span className="text-muted-foreground">Not selected</span>
                        )}
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{formatDate(stmt.createdAt)}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">View only</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileSpreadsheet}
              title="No comparative statements found"
              description={
                searchQuery
                  ? "No statements match your search criteria"
                  : "Create comparative statements to analyze quotations"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
