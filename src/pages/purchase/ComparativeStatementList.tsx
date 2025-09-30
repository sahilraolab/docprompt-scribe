import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, FileSpreadsheet, Loader2 } from 'lucide-react';
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

  // Mock data - will be replaced with real API
  const statements = [
    {
      id: '1',
      mrCode: 'MR-2024-001',
      quotationsCount: 3,
      selectedSupplier: 'ABC Suppliers',
      createdAt: '2024-01-15',
      createdBy: 'John Doe'
    },
    {
      id: '2',
      mrCode: 'MR-2024-002',
      quotationsCount: 2,
      selectedSupplier: null,
      createdAt: '2024-01-20',
      createdBy: 'Jane Smith'
    }
  ];

  const filteredStatements = statements.filter((stmt) =>
    stmt.mrCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stmt.selectedSupplier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comparative Statements</h1>
          <p className="text-muted-foreground">Compare supplier quotations</p>
        </div>
        <Button onClick={() => navigate('/purchase/comparative/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Statement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by MR code or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredStatements.length > 0 ? (
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
                      <TableCell>{stmt.quotationsCount} quotes</TableCell>
                      <TableCell>
                        {stmt.selectedSupplier || (
                          <span className="text-muted-foreground">Not selected</span>
                        )}
                      </TableCell>
                      <TableCell>{stmt.createdBy}</TableCell>
                      <TableCell>{formatDate(stmt.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/purchase/comparative/${stmt.id}`)}
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
              action={
                !searchQuery
                  ? {
                      label: "Create Statement",
                      onClick: () => navigate('/purchase/comparative/new'),
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
