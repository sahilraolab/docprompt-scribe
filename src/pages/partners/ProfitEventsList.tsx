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
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useProfitEvents } from '@/lib/hooks/usePartners';

export default function ProfitEventsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: profitEvents = [], isLoading } = useProfitEvents();

  const filteredEvents = profitEvents.filter(event =>
    event.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'project',
      header: 'Project',
      render: (event: typeof profitEvents[0]) => (
        <p className="font-medium">{event.projectName || '-'}</p>
      ),
    },
    {
      key: 'period',
      header: 'Period',
      render: (event: typeof profitEvents[0]) => (
        <div className="text-sm">
          <p>{formatDate(event.periodFrom)}</p>
          <p className="text-muted-foreground">to {formatDate(event.periodTo)}</p>
        </div>
      ),
    },
    {
      key: 'profit',
      header: 'Profit/Loss',
      render: (event: typeof profitEvents[0]) => (
        <span className={`font-mono text-sm font-semibold ${event.profitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(event.profitAmount)}
        </span>
      ),
    },
    {
      key: 'note',
      header: 'Note',
      render: (event: typeof profitEvents[0]) => (
        <p className="text-sm text-muted-foreground">{event.note || '-'}</p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (event: typeof profitEvents[0]) => {
        const variant = 
          event.status === 'Distributed' ? 'default' :
          event.status === 'Approved' ? 'secondary' :
          'outline';
        return <Badge variant={variant}>{event.status}</Badge>;
      },
    },
    {
      key: 'approved',
      header: 'Approved By',
      render: (event: typeof profitEvents[0]) => (
        <div className="text-sm">
          {event.approvedBy ? (
            <>
              <p>{event.approvedBy}</p>
              <p className="text-muted-foreground">{formatDate(event.approvedAt!)}</p>
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (event: typeof profitEvents[0]) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/partners/profit-events/${event.id}`)}
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
        title="Profit Events"
        description="Track and manage profit distributions"
        actions={[
          {
            label: 'Create Profit Event',
            onClick: () => navigate('/partners/profit-events/new'),
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
                placeholder="Search by project name or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <DataTable data={filteredEvents} columns={columns} />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No profit events found"
              description={
                searchQuery
                  ? "No profit events match your search criteria"
                  : "Get started by creating a profit event"
              }
              action={
                !searchQuery
                  ? {
                      label: 'Create Profit Event',
                      onClick: () => navigate('/partners/profit-events/new'),
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
