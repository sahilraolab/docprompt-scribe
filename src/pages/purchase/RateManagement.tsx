import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { exportData } from '@/lib/utils/export-enhanced';
import { Plus, Search, TrendingUp, Loader2, Download, Edit } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMaterialRates } from '@/lib/hooks/usePurchaseBackend';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function RateManagement() {
  const navigate = useNavigate();

  // Filters & state
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortBy] = useState('date');

  // Fetch API data
  const { data, isLoading, isError } = useMaterialRates();
  const rates = data || [];

  // Map backend response to UI-friendly format
  const formattedRates = useMemo(() => {
    return rates.map((rate) => ({
      id: rate._id,
      itemId: rate.itemId?._id,
      itemName: rate.itemId?.name || '-',
      supplierId: rate.supplierId?._id,
      supplierName: rate.supplierId?.name || '-',
      rate: rate.rate,
      uom: rate.uom,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo,
      isActive: rate.active,
      createdAt: rate.createdAt,
    }));
  }, [rates]);

  // Filter and sort logic
  const filteredRates =
   useMemo(() => {
    if (!formattedRates.length) return [];

    return formattedRates
      .filter((rate) => {
        const itemName = rate?.itemName?.toLowerCase() || '';
        const supplierName = rate?.supplierName?.toLowerCase() || '';
        const search = searchQuery?.toLowerCase() || '';

        const matchesSearch =
          itemName.includes(search) || supplierName.includes(search);

        const matchesSupplier =
          supplierFilter === 'all' || rate.supplierName === supplierFilter;

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' && rate.isActive) ||
          (statusFilter === 'inactive' && !rate.isActive);

        return matchesSearch && matchesSupplier && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date':
            return (
              new Date(b.effectiveFrom).getTime() -
              new Date(a.effectiveFrom).getTime()
            );
          case 'item':
            return (a.itemName || '').localeCompare(b.itemName || '');
          case 'rate':
            return (b.rate || 0) - (a.rate || 0);
          case 'supplier':
            return (a.supplierName || '').localeCompare(b.supplierName || '');
          default:
            return 0;
        }
      });
  }, [formattedRates, searchQuery, supplierFilter, statusFilter, sortBy]);


  // Export CSV
  const handleExport = () => {
    if (!filteredRates.length) return;

    const exportableData = filteredRates.map((rate) => ({
      Item: rate.itemName,
      Supplier: rate.supplierName,
      Rate: rate.rate,
      UOM: rate.uom,
      'Effective From': formatDate(rate.effectiveFrom),
      'Effective To': rate.effectiveTo ? formatDate(rate.effectiveTo) : 'Current',
      Status: rate.isActive ? 'Active' : 'Inactive',
    }));

    exportData(exportableData, { filename: 'material-rates', format: 'csv' });
  };

  // Unique supplier list
  const uniqueSuppliers = Array.from(
    new Set(formattedRates.map((r) => r.supplierName).filter(Boolean))
  );

  // UI States
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return <p className="text-center text-red-500">Failed to load material rates.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rate Management</h1>
          <p className="text-muted-foreground">
            Track and manage material rates from suppliers
          </p>
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item or supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Supplier Filter */}
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

            {/* Status Filter */}
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

            {/* Sort Filter */}
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

        {/* Table */}
        <CardContent>
          {filteredRates.length > 0 ? (
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
                        {rate.effectiveTo ? (
                          formatDate(rate.effectiveTo)
                        ) : (
                          <span className="text-muted-foreground">Current</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${rate.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                        >
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
                  ? 'No rates match your search criteria'
                  : 'Start tracking material rates from suppliers'
              }
              action={
                !searchQuery
                  ? {
                    label: 'Add Rate',
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
