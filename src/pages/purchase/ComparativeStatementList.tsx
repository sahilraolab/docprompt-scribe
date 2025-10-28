import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, FileSpreadsheet, Loader2, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const { data: statements = [], isLoading } = useComparativeStatements();

  const filteredStatements = useMemo(() => {
    return statements
      ?.filter((stmt) =>
        stmt?.mrId?.code?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'date')
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'mr')
          return (a?.mrId?.code || '').localeCompare(b?.mrId?.code || '');
        return 0;
      });
  }, [statements, searchQuery, sortBy]);

  const handleExport = () => {
    if (!filteredStatements?.length) return;
    const data = filteredStatements.map((stmt) => ({
      'MR Code': stmt?.mrId?.code || '-',
      'Project': stmt?.projectId?.name || '-',
      'Selected Supplier': stmt?.selectedSupplier?.name || 'Not selected',
      'Status': stmt?.status || '-',
      'Date': formatDate(stmt?.createdAt),
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comparative Statements</h1>
          <p className="text-muted-foreground">Compare supplier quotations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/purchase/comparative/new')}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search + Sort Controls */}
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

        {/* Table Section */}
        <CardContent>
          {filteredStatements?.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MR Code</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Selected Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStatements.map((stmt) => (
                    <TableRow
                      key={stmt._id}
                      // onClick={() => navigate(`/purchase/comparative-statements/${stmt._id}`)}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{stmt?.mrId?.code || '-'}</TableCell>
                      <TableCell>{stmt?.projectId?.name || '-'}</TableCell>
                      <TableCell>
                        {stmt?.selectedSupplier?.name ||
                          stmt?.selectedSupplierId?.name ||
                          <span className="text-muted-foreground">Not selected</span>}
                      </TableCell>
                      <TableCell>{stmt?.status || '-'}</TableCell>
                      <TableCell>{formatDate(stmt?.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/purchase/comparative/${stmt._id}/view`);
                          }}
                        >
                          View
                        </Button>
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
