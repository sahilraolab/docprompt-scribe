import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContractors } from '@/lib/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { Plus, Search, Users, Loader2, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ContractorsList() {
  const navigate = useNavigate();
  const { data: contractors, isLoading } = useContractors();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContractors = contractors?.filter((contractor) =>
    contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contractor.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Contractors</h1>
          <p className="text-muted-foreground">Manage contractor database</p>
        </div>
        <Button onClick={() => navigate('/contracts/contractors/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Contractor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredContractors && filteredContractors.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact Person</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>GST Number</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContractors.map((contractor) => (
                    <TableRow
                      key={contractor._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/contracts/contractors/${contractor._id}/view`)}
                    >
                      <TableCell className="font-medium">{contractor.name}</TableCell>
                      <TableCell>{contractor.contact}</TableCell>
                      <TableCell>{contractor.phone || 'N/A'}</TableCell>
                      <TableCell className="font-mono text-sm">{contractor.gst || 'N/A'}</TableCell>
                      <TableCell>
                        {contractor.city && contractor.state
                          ? `${contractor.city}, ${contractor.state}`
                          : contractor.city || contractor.state || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{contractor.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={contractor.active ? 'default' : 'secondary'}>
                          {contractor.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No contractors found"
              description={
                searchQuery
                  ? "No contractors match your search criteria"
                  : "Add contractors to manage subcontracting work"
              }
              action={
                !searchQuery
                  ? {
                      label: "Add Contractor",
                      onClick: () => navigate('/contracts/contractors/new'),
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
