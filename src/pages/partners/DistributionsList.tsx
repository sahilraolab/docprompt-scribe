import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { DataTable } from '@/components/DataTable';
import { Search, Receipt, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';

const mockDistributions = [
  {
    id: '1',
    projectName: 'Green Valley Residency',
    partnerName: 'Rajesh Kumar',
    periodFrom: '2024-01-01',
    periodTo: '2024-03-31',
    amount: 1200000,
    reference: 'Q1 profit distribution',
  },
  {
    id: '2',
    projectName: 'City Mall Expansion',
    partnerName: 'ABC Builders Pvt Ltd',
    periodFrom: '2023-10-01',
    periodTo: '2023-12-31',
    amount: 800000,
    reference: 'FY23 Q4 distribution',
  },
];

export default function DistributionsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockDistributions.filter((d) =>
    d.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'project',
      header: 'Project',
      render: (d: typeof mockDistributions[0]) => <p className="font-medium">{d.projectName}</p>,
    },
    {
      key: 'partner',
      header: 'Partner',
      render: (d: typeof mockDistributions[0]) => <p className="text-sm">{d.partnerName}</p>,
    },
    {
      key: 'period',
      header: 'Period',
      render: (d: typeof mockDistributions[0]) => (
        <div className="text-sm">
          <p>{formatDate(d.periodFrom)}</p>
          <p className="text-muted-foreground">to {formatDate(d.periodTo)}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (d: typeof mockDistributions[0]) => (
        <span className="font-mono text-sm">{formatCurrency(d.amount)}</span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (d: typeof mockDistributions[0]) => <span className="text-sm text-muted-foreground">{d.reference}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (d: typeof mockDistributions[0]) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/partners/distributions/${d.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

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
