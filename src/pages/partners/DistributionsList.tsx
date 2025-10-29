import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { DataTable } from '@/components/DataTable';
import { Search, Receipt, Eye, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useDistributions } from '@/lib/hooks/usePartners';

export default function DistributionsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: distributions = [], isLoading } = useDistributions();

  const filtered = distributions.filter((d) =>
    d.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.partnerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'project',
      header: 'Project',
      render: (d: typeof distributions[0]) => <p className="font-medium">{d.projectName || '-'}</p>,
    },
    {
      key: 'partner',
      header: 'Partner',
      render: (d: typeof distributions[0]) => <p className="text-sm">{d.partnerName || '-'}</p>,
    },
    {
      key: 'period',
      header: 'Period',
      render: (d: typeof distributions[0]) => (
        <div className="text-sm">
          <p>{formatDate(d.periodFrom)}</p>
          <p className="text-muted-foreground">to {formatDate(d.periodTo)}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (d: typeof distributions[0]) => (
        <span className="font-mono text-sm">{formatCurrency(d.amount)}</span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (d: typeof distributions[0]) => <span className="text-sm text-muted-foreground">{d.reference || '-'}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d: typeof distributions[0]) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/partners/distributions/${d.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Distributions" description="Partner payout history and details" />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by project or partner name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <DataTable data={filtered} columns={columns} />
          ) : (
            <EmptyState
              icon={Receipt}
              title="No distributions found"
              description={
                searchQuery
                  ? 'No distributions match your search criteria'
                  : 'Distributions will appear once profit events are processed'
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
