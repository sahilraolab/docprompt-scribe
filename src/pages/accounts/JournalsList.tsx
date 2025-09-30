import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, BookOpen } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function JournalsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const journals = [
    {
      id: '1',
      journalNo: 'JV-2024-001',
      date: '2024-01-15',
      description: 'Material purchase entry',
      type: 'Payment',
      debitTotal: 500000,
      creditTotal: 500000,
      status: 'Approved' as const,
      createdBy: 'Accountant',
    },
    {
      id: '2',
      journalNo: 'JV-2024-002',
      date: '2024-01-18',
      description: 'Contractor payment - WO-2024-001',
      type: 'Payment',
      debitTotal: 850000,
      creditTotal: 850000,
      status: 'Pending' as const,
      createdBy: 'Accountant',
    },
    {
      id: '3',
      journalNo: 'JV-2024-003',
      date: '2024-01-20',
      description: 'Revenue recognition - Green Valley',
      type: 'Receipt',
      debitTotal: 2000000,
      creditTotal: 2000000,
      status: 'Approved' as const,
      createdBy: 'Finance Manager',
    },
    {
      id: '4',
      journalNo: 'JV-2024-004',
      date: '2024-01-22',
      description: 'Depreciation entry',
      type: 'Journal',
      debitTotal: 150000,
      creditTotal: 150000,
      status: 'Draft' as const,
      createdBy: 'Accountant',
    },
  ];

  const filteredJournals = journals.filter((journal) =>
    journal.journalNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Payment':
        return 'bg-red-100 text-red-800';
      case 'Receipt':
        return 'bg-green-100 text-green-800';
      case 'Journal':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Journal Entries</h1>
          <p className="text-muted-foreground">Double-entry accounting journals</p>
        </div>
        <Button onClick={() => navigate('/accounts/journals/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Journal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by journal no or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredJournals.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Journal No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Debit Total</TableHead>
                    <TableHead>Credit Total</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJournals.map((journal) => (
                    <TableRow
                      key={journal.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/accounts/journals/${journal.id}`)}
                    >
                      <TableCell className="font-medium">{journal.journalNo}</TableCell>
                      <TableCell>{formatDate(journal.date)}</TableCell>
                      <TableCell>{journal.description}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(journal.type)} variant="secondary">
                          {journal.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(journal.debitTotal)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(journal.creditTotal)}
                      </TableCell>
                      <TableCell>{journal.createdBy}</TableCell>
                      <TableCell>
                        <StatusBadge status={journal.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No journal entries found"
              description={
                searchQuery
                  ? "No journals match your search criteria"
                  : "Create journal entries for accounting transactions"
              }
              action={
                !searchQuery
                  ? {
                      label: "Create Journal",
                      onClick: () => navigate('/accounts/journals/new'),
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
