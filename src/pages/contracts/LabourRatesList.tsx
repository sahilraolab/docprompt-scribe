import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Users, Loader2 } from 'lucide-react';
import { useLabourRates } from '@/lib/hooks/useContracts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function LabourRatesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: labourRates, isLoading } = useLabourRates();

  const filteredRates = labourRates?.filter((rate) =>
    rate.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rate.location?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
          <h1 className="text-3xl font-bold">Labour Rates</h1>
          <p className="text-muted-foreground">Manage labour category rates and wages</p>
        </div>
        <Button onClick={() => navigate('/contracts/labour-rates/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rate
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by category or skill level..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredRates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective To</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRates.map((rate) => (
                    <TableRow
                      key={rate._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/contracts/labour-rates/${rate._id}`)}
                    >
                      <TableCell className="font-medium">{rate.category}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{rate.location}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(rate.dailyRate, 'full')}
                      </TableCell>
                      <TableCell>per day</TableCell>
                      <TableCell>{formatDate(rate.effectiveFrom)}</TableCell>
                      <TableCell>
                        {rate.effectiveTo ? formatDate(rate.effectiveTo) : (
                          <span className="text-muted-foreground">Ongoing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800" variant="secondary">
                          Active
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
              title="No labour rates found"
              description={
                searchQuery
                  ? "No rates match your search criteria"
                  : "Define labour category rates for cost estimation"
              }
              action={
                !searchQuery
                  ? {
                      label: "Add Rate",
                      onClick: () => navigate('/contracts/labour-rates/new'),
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
