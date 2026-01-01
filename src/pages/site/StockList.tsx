import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '@/lib/hooks/useSite';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import { Search, Package, Loader2, AlertTriangle, Download, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportToCSV } from '@/lib/utils/export';

export default function StockList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [showLowStock, setShowLowStock] = useState(false);
  
  const { data: stock = [], isLoading } = useStock();
  const { data: projects = [] } = useProjects();

  const filteredStock = stock.filter((s: any) => {
    const matchesSearch = 
      s.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.itemId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.projectId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProject = projectFilter === 'all' || 
      (s.projectId?._id || s.projectId) === projectFilter;
    
    const isLowStock = (s.quantity || s.qty || 0) < (s.reorderLevel || s.minQty || 10);
    const matchesLowStock = !showLowStock || isLowStock;
    
    return matchesSearch && matchesProject && matchesLowStock;
  });

  const totalValue = filteredStock.reduce((sum: number, s: any) => 
    sum + ((s.quantity || s.qty || 0) * (s.rate || s.unitPrice || 0)), 0);
  
  const lowStockCount = stock.filter((s: any) => 
    (s.quantity || s.qty || 0) < (s.reorderLevel || s.minQty || 10)).length;

  const handleExport = () => {
    const data = filteredStock.map((s: any) => ({
      Item: s.itemName || s.itemId?.name,
      Code: s.itemCode || s.itemId?.code,
      Location: s.location,
      Project: s.projectName || s.projectId?.name,
      Quantity: s.quantity || s.qty,
      UOM: s.uom || s.itemId?.uom,
      'Unit Price': s.rate || s.unitPrice,
      Value: (s.quantity || s.qty || 0) * (s.rate || s.unitPrice || 0),
      'Min Qty': s.reorderLevel || s.minQty,
      Status: (s.quantity || s.qty || 0) < (s.reorderLevel || s.minQty || 10) ? 'Low Stock' : 'Adequate',
    }));
    exportToCSV(data, `stock-report-${new Date().toISOString().split('T')[0]}`);
  };

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
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground">Track inventory across all project locations</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
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

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item, location, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((p: any) => (
                  <SelectItem key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Low Stock Only
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStock.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Min Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item: any) => {
                    const qty = item.quantity || item.qty || 0;
                    const minQty = item.reorderLevel || item.minQty || 10;
                    const rate = item.rate || item.unitPrice || 0;
                    const isLow = qty < minQty;
                    
                    return (
                      <TableRow key={item._id || item.id} className={isLow ? 'bg-amber-50/50' : ''}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.itemName || item.itemId?.name}</p>
                            <p className="text-sm text-muted-foreground">{item.itemCode || item.itemId?.code}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>{item.projectName || item.projectId?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {qty} {item.uom || item.itemId?.uom}
                        </TableCell>
                        <TableCell className="text-right">{minQty}</TableCell>
                        <TableCell className="text-right">{formatCurrency(rate)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(qty * rate)}</TableCell>
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
              icon={Package}
              title="No stock records found"
              description={
                searchQuery || projectFilter !== 'all' || showLowStock
                  ? "No stock records match your filters"
                  : "Stock records will appear here once materials are received via GRN"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}