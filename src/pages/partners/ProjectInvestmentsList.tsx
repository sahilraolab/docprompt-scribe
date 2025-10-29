import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { DataTable } from '@/components/DataTable';
import { Plus, Search, TrendingUp, Eye, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { useInvestments } from '@/lib/hooks/usePartners';

export default function ProjectInvestmentsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: investments = [], isLoading } = useInvestments();

  const filteredInvestments = investments.filter(inv =>
    inv.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.partnerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'project',
      header: 'Project',
      render: (inv: typeof investments[0]) => (
        <p className="font-medium">{inv.projectName || '-'}</p>
      ),
    },
    {
      key: 'partner',
      header: 'Partner',
      render: (inv: typeof investments[0]) => (
        <p className="text-sm">{inv.partnerName || '-'}</p>
      ),
    },
    {
      key: 'share',
      header: 'Share %',
      render: (inv: typeof investments[0]) => (
        <Badge variant="outline">{inv.sharePercent}%</Badge>
      ),
    },
    {
      key: 'preferred',
      header: 'Preferred Return',
      render: (inv: typeof investments[0]) => (
        <span className="text-sm">
          {inv.preferredReturnPercent > 0 ? `${inv.preferredReturnPercent}% p.a.` : 'None'}
        </span>
      ),
    },
    {
      key: 'contributions',
      header: 'Total Contributions',
      render: (inv: typeof investments[0]) => (
        <span className="font-mono text-sm">
          {formatCurrency(inv.totalContributions)}
        </span>
      ),
    },
    {
      key: 'distributions',
      header: 'Total Distributions',
      render: (inv: typeof investments[0]) => (
        <span className="font-mono text-sm text-green-600">
          {formatCurrency(inv.totalDistributions)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv: typeof investments[0]) => (
        <Badge variant={inv.active ? 'default' : 'secondary'}>
          {inv.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv: typeof investments[0]) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/partners/investments/${inv.id}`)}
        >
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
      <PageHeader
        title="Project Investments"
        description="Manage partner investments and shareholdings"
        actions={[
          {
            label: 'Add Investment',
            onClick: () => navigate('/partners/investments/new'),
            icon: Plus,
          },
        ]}
      />

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

          {filteredInvestments.length > 0 ? (
            <DataTable data={filteredInvestments} columns={columns} />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No investments found"
              description={
                searchQuery
                  ? "No investments match your search criteria"
                  : "Get started by adding a project investment"
              }
              action={
                !searchQuery
                  ? {
                      label: 'Add Investment',
                      onClick: () => navigate('/partners/investments/new'),
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
