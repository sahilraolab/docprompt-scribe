import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, BookOpen, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useJournals } from '@/lib/hooks/useAccounts';

export default function JournalsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: journals, isLoading } = useJournals();

  const filteredJournals = journals?.filter((journal) =>
    journal.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journal.narration?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Payment':
        return 'bg-red-100 text-red-800';
      case 'Receipt':
        return 'bg-green-100 text-green-800';
      case 'Journal':
      case 'General':
        return 'bg-blue-100 text-blue-800';
      case 'Contra':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                    <TableHead>Journal Code</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Debit Total</TableHead>
                    <TableHead>Credit Total</TableHead>
                    <TableHead>Project</TableHead>
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
                      <TableCell className="font-medium">{journal.code}</TableCell>
                      <TableCell>{formatDate(journal.date)}</TableCell>
                      <TableCell>{journal.narration || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(journal.type)} variant="secondary">
                          {journal.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(journal.totalDebit)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(journal.totalCredit)}
                      </TableCell>
                      <TableCell>{journal.projectName || '-'}</TableCell>
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
