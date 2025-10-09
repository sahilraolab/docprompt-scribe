import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, TrendingUp, Loader2, Download, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface MaterialRate {
  id: string;
  itemId: string;
  itemName: string;
  supplierId: string;
  supplierName: string;
  rate: number;
  uom: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
}

async function fetchMaterialRates(): Promise<MaterialRate[]> {
  const response = await fetch('/api/material-rates');
  if (!response.ok) throw new Error('Failed to fetch material rates');
  const data = await response.json();
  return data.data;
}

export default function RateManagement() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [sortBy, setSortBy] = useState<string>('date');

  const { data: rates, isLoading } = useQuery({
    queryKey: ['material-rates'],
    queryFn: fetchMaterialRates,
  });

  const filteredRates = rates
    ?.filter((rate) => {
      const matchesSearch = 
        rate.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSupplier = supplierFilter === 'all' || rate.supplierId === supplierFilter;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && rate.isActive) ||
        (statusFilter === 'inactive' && !rate.isActive);
      return matchesSearch && matchesSupplier && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime();
      if (sortBy === 'item') return a.itemName.localeCompare(b.itemName);
      if (sortBy === 'rate') return b.rate - a.rate;
      if (sortBy === 'supplier') return a.supplierName.localeCompare(b.supplierName);
      return 0;
    });

  const handleExport = () => {
    if (!filteredRates) return;
    const data = filteredRates.map((rate) => ({
      'Item': rate.itemName,
      'Supplier': rate.supplierName,
      'Rate': rate.rate,
      'UOM': rate.uom,
      'Effective From': rate.effectiveFrom,
      'Effective To': rate.effectiveTo || 'Current',
      'Status': rate.isActive ? 'Active' : 'Inactive',
    }));
    exportData(data, { filename: 'material-rates', format: 'csv' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const uniqueSuppliers = Array.from(new Set(rates?.map(r => r.supplierName) || []));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Management</h1>
          <p className="text-muted-foreground">Track and manage material rates from suppliers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/purchase/rates/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rate
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {uniqueSuppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="item">Item Name</SelectItem>
                <SelectItem value="rate">Rate</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRates && filteredRates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>UOM</TableHead>
                    <TableHead>Effective From</TableHead>
                    <TableHead>Effective To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRates.map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">{rate.itemName}</TableCell>
                      <TableCell>{rate.supplierName}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(rate.rate)}
                      </TableCell>
                      <TableCell>{rate.uom}</TableCell>
                      <TableCell>{formatDate(rate.effectiveFrom)}</TableCell>
                      <TableCell>
                        {rate.effectiveTo ? formatDate(rate.effectiveTo) : (
                          <span className="text-muted-foreground">Current</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          rate.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {rate.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/purchase/rates/${rate.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No rates found"
              description={
                searchQuery
                  ? "No rates match your search criteria"
                  : "Start tracking material rates from suppliers"
              }
              action={
                !searchQuery
                  ? {
                      label: "Add Rate",
                      onClick: () => navigate('/purchase/rates/new'),
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
