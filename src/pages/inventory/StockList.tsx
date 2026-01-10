/**
 * Stock List Page
 * Aligned with backend: GET /inventory/stock
 */

import { useState } from 'react';
import { useStock } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatCurrency } from '@/lib/utils/format';
import { Search, Warehouse, Loader2, AlertTriangle, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { exportToCSV } from '@/lib/utils/export';

export default function StockList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);

  const { data: projects = [] } = useProjects();
  const { data: stock = [], isLoading } = useStock(
    selectedProjectId ? { projectId: selectedProjectId } : undefined,
    { enabled: !!selectedProjectId }
  );

  const filteredStock = stock.filter((s: any) => {
    const matchesSearch =
      s.materialName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.materialCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.locationName?.toLowerCase().includes(searchQuery.toLowerCase());

    const isLow = (s.quantity || 0) < 10; // Default min threshold
    const matchesLowStock = !showLowStock || isLow;

    return matchesSearch && matchesLowStock;
  });

  const totalValue = filteredStock.reduce((sum: number, s: any) => sum + (s.value || 0), 0);
  const lowStockCount = stock.filter((s: any) => (s.quantity || 0) < 10).length;

  const handleExport = () => {
    const data = filteredStock.map((s: any) => ({
      Material: s.materialName || s.materialCode,
      Code: s.materialCode,
      Location: s.locationName || s.locationId,
      Quantity: s.quantity,
      UOM: s.uom,
      Rate: s.rate,
      Value: s.value,
      Status: (s.quantity || 0) < 10 ? 'Low Stock' : 'Adequate',
    }));
    exportToCSV(data, `stock-report-${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Register</h1>
          <p className="text-muted-foreground">Current stock levels by project and location</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={!selectedProjectId}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      {selectedProjectId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Items</CardDescription>
              <CardTitle className="text-2xl">{stock.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Stock Value</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalValue)}</CardTitle>
            </CardHeader>
          </Card>
          <Card className={lowStockCount > 0 ? 'border-amber-500' : ''}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                {lowStockCount > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                Low Stock Alerts
              </CardDescription>
              <CardTitle className={`text-2xl ${lowStockCount > 0 ? 'text-amber-600' : ''}`}>
                {lowStockCount}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchableSelect
                options={projects.map((p: any) => ({
                  value: p.id || p._id,
                  label: `${p.name} (${p.code || 'N/A'})`,
                }))}
                value={selectedProjectId?.toString() || ''}
                onChange={(val) => setSelectedProjectId(val ? Number(val) : null)}
                placeholder="Select project to view stock..."
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by material or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={!selectedProjectId}
              />
            </div>
            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
              disabled={!selectedProjectId}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock Only
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedProjectId ? (
            <EmptyState
              icon={Warehouse}
              title="Select a Project"
              description="Choose a project to view its stock levels"
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredStock.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item: any) => {
                    const qty = item.quantity || 0;
                    const rate = item.rate || 0;
                    const value = item.value || qty * rate;
                    const isLow = qty < 10;

                    return (
                      <TableRow key={item.id} className={isLow ? 'bg-amber-50/50' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.materialName}</p>
                            <p className="text-sm text-muted-foreground">{item.materialCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.locationName || item.locationId}</TableCell>
                        <TableCell className="text-right font-medium">
                          {qty} {item.uom}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(rate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(value)}</TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="default">Adequate</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Warehouse}
              title="No stock records found"
              description={
                searchQuery || showLowStock
                  ? 'No stock records match your filters'
                  : 'Stock records will appear here once materials are received via GRN'
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
