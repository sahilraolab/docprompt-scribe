import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { DataTable } from '@/components/DataTable';
import { Plus, Search, Users, Mail, Phone, Eye, Loader2 } from 'lucide-react';
import { usePartners } from '@/lib/hooks/usePartners';

export default function PartnersList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: partners = [], isLoading } = usePartners();

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'code',
      header: 'Code',
      render: (partner: typeof partners[0]) => (
        <span className="font-mono text-sm">{partner.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (partner: typeof partners[0]) => (
        <div>
          <p className="font-medium">{partner.name}</p>
          <Badge variant="outline" className="mt-1">
            {partner.type}
          </Badge>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (partner: typeof partners[0]) => (
        <div className="text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3" />
            {partner.email}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <Phone className="h-3 w-3" />
            {partner.phone}
          </div>
        </div>
      ),
    },
    {
      key: 'tax',
      header: 'Tax Details',
      render: (partner: typeof partners[0]) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">PAN:</span>
            <span className="font-mono">{partner.pan}</span>
          </div>
          {partner.gst && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">GST:</span>
              <span className="font-mono text-xs">{partner.gst}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (partner: typeof partners[0]) => (
        <Badge variant={partner.active ? 'default' : 'secondary'}>
          {partner.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (partner: typeof partners[0]) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/partners/list/${partner.id}`)}
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
        title="Partners"
        description="Manage investors and business partners"
        actions={[
          {
            label: 'Add Partner',
            onClick: () => navigate('/partners/list/new'),
            icon: Plus,
          },
        ]}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners by name, code, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPartners.length > 0 ? (
            <DataTable data={filteredPartners} columns={columns} />
          ) : (
            <EmptyState
              icon={Users}
              title="No partners found"
              description={
                searchQuery
                  ? "No partners match your search criteria"
                  : "Get started by adding your first partner"
              }
              action={
                !searchQuery
                  ? {
                      label: 'Add Partner',
                      onClick: () => navigate('/partners/list/new'),
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
