import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Plus, Search, Users } from 'lucide-react';
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

  // Mock data
  const labourRates = [
    {
      id: '1',
      category: 'Mason',
      skillLevel: 'Skilled',
      rate: 800,
      unit: 'per day',
      effectiveFrom: '2024-01-01',
      effectiveTo: null,
      isActive: true,
    },
    {
      id: '2',
      category: 'Carpenter',
      skillLevel: 'Skilled',
      rate: 850,
      unit: 'per day',
      effectiveFrom: '2024-01-01',
      effectiveTo: null,
      isActive: true,
    },
    {
      id: '3',
      category: 'Helper',
      skillLevel: 'Unskilled',
      rate: 500,
      unit: 'per day',
      effectiveFrom: '2024-01-01',
      effectiveTo: null,
      isActive: true,
    },
    {
      id: '4',
      category: 'Electrician',
      skillLevel: 'Skilled',
      rate: 900,
      unit: 'per day',
      effectiveFrom: '2024-01-01',
      effectiveTo: null,
      isActive: true,
    },
    {
      id: '5',
      category: 'Plumber',
      skillLevel: 'Skilled',
      rate: 850,
      unit: 'per day',
      effectiveFrom: '2024-01-01',
      effectiveTo: null,
      isActive: true,
    },
    {
      id: '6',
      category: 'Welder',
      skillLevel: 'Skilled',
      rate: 950,
      unit: 'per day',
      effectiveFrom: '2024-01-01',
      effectiveTo: null,
      isActive: true,
    },
    {
      id: '7',
      category: 'Mason',
      skillLevel: 'Skilled',
      rate: 750,
      unit: 'per day',
      effectiveFrom: '2023-01-01',
      effectiveTo: '2023-12-31',
      isActive: false,
    },
  ];

  const filteredRates = labourRates.filter((rate) =>
    rate.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rate.skillLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSkillBadgeColor = (skill: string) => {
    return skill === 'Skilled' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

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
                    <TableHead>Skill Level</TableHead>
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
                      key={rate.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/contracts/labour-rates/${rate.id}`)}
                    >
                      <TableCell className="font-medium">{rate.category}</TableCell>
                      <TableCell>
                        <Badge className={getSkillBadgeColor(rate.skillLevel)} variant="secondary">
                          {rate.skillLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(rate.rate, 'full')}
                      </TableCell>
                      <TableCell>{rate.unit}</TableCell>
                      <TableCell>{formatDate(rate.effectiveFrom)}</TableCell>
                      <TableCell>
                        {rate.effectiveTo ? formatDate(rate.effectiveTo) : (
                          <span className="text-muted-foreground">Ongoing</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {rate.isActive ? (
                          <Badge className="bg-green-100 text-green-800" variant="secondary">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Inactive
                          </Badge>
                        )}
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
