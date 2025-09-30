import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItems } from '@/lib/hooks/useSite';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { Plus, Search, Package, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ItemsList() {
  const navigate = useNavigate();
  const { data: items, isLoading } = useItems();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items?.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">Items Master</h1>
          <p className="text-muted-foreground">Manage material and equipment inventory</p>
        </div>
        <Button onClick={() => navigate('/site/items/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems && filteredItems.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Qty</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/items/${item.id}`)}
                    >
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell className="font-medium">{item.currentStock || 0}</TableCell>
                      <TableCell>{item.minQty || 'N/A'}</TableCell>
                      <TableCell>
                        {item.currentStock && item.minQty && item.currentStock < item.minQty ? (
                          <Badge variant="destructive">Low Stock</Badge>
                        ) : (
                          <Badge variant="default">In Stock</Badge>
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
              title="No items found"
              description={
                searchQuery
                  ? "No items match your search criteria"
                  : "Add items to track inventory"
              }
              action={
                !searchQuery
                  ? {
                      label: "Add Item",
                      onClick: () => navigate('/site/items/new'),
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
