import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { DataTable } from '@/components/DataTable';
import { Plus, Search, TrendingUp, Eye, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

// Mock data
const mockInvestments = [
  {
    id: '1',
    projectName: 'Green Valley Residency',
    partnerName: 'Rajesh Kumar',
    sharePercent: 25,
    preferredReturnPercent: 12,
    totalContributions: 25000000,
    totalDistributions: 3000000,
    active: true,
  },
  {
    id: '2',
    projectName: 'City Mall Expansion',
    partnerName: 'ABC Builders Pvt Ltd',
    sharePercent: 40,
    preferredReturnPercent: 0,
    totalContributions: 50000000,
    totalDistributions: 0,
    active: true,
  },
  {
    id: '3',
    projectName: 'Smart Office Complex',
    partnerName: 'Priya Sharma',
    sharePercent: 15,
    preferredReturnPercent: 10,
    totalContributions: 15000000,
    totalDistributions: 1500000,
    active: true,
  },
];

export default function ProjectInvestmentsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvestments = mockInvestments.filter(inv =>
    inv.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'project',
      header: 'Project',
      render: (inv: typeof mockInvestments[0]) => (
        <p className="font-medium">{inv.projectName}</p>
      ),
    },
    {
      key: 'partner',
      header: 'Partner',
      render: (inv: typeof mockInvestments[0]) => (
        <p className="text-sm">{inv.partnerName}</p>
      ),
    },
    {
      key: 'share',
      header: 'Share %',
      render: (inv: typeof mockInvestments[0]) => (
        <Badge variant="outline">{inv.sharePercent}%</Badge>
      ),
    },
    {
      key: 'preferred',
      header: 'Preferred Return',
      render: (inv: typeof mockInvestments[0]) => (
        <span className="text-sm">
          {inv.preferredReturnPercent > 0 ? `${inv.preferredReturnPercent}% p.a.` : 'None'}
        </span>
      ),
    },
    {
      key: 'contributions',
      header: 'Total Contributions',
      render: (inv: typeof mockInvestments[0]) => (
        <span className="font-mono text-sm">
          {formatCurrency(inv.totalContributions)}
        </span>
      ),
    },
    {
      key: 'distributions',
      header: 'Total Distributions',
      render: (inv: typeof mockInvestments[0]) => (
        <span className="font-mono text-sm text-green-600">
          {formatCurrency(inv.totalDistributions)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv: typeof mockInvestments[0]) => (
        <Badge variant={inv.active ? 'default' : 'secondary'}>
          {inv.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (inv: typeof mockInvestments[0]) => (
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
