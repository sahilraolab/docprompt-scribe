import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '@/lib/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/utils/format';
import { Plus, Search, Package, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function StockList() {
  const navigate = useNavigate();
  const { data: stock, isLoading } = useStock();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStock = stock?.filter((s) =>
    s.itemName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground">Track inventory across all locations</p>
        </div>
        <Button onClick={() => navigate('/site/stock/adjust')}>
          <Plus className="h-4 w-4 mr-2" />
          Adjust Stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by item, location, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredStock && filteredStock.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Min Qty</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStock.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.projectName || 'N/A'}</TableCell>
                      <TableCell className="font-medium">{item.qty}</TableCell>
                      <TableCell>{item.minQty || 'N/A'}</TableCell>
                      <TableCell>{item.value ? formatCurrency(item.value) : 'N/A'}</TableCell>
                      <TableCell>
                        {item.minQty && item.qty < item.minQty ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="default">Adequate</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No stock records found"
              description={
                searchQuery
                  ? "No stock records match your search criteria"
                  : "Stock records will appear here once materials are received"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
