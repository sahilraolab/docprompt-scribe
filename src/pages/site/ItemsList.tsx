import { useState, useMemo } from 'react';
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
  const { data: items = [], isLoading, isError } = useItems();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items by name, code, or category
  const filteredItems = useMemo(() => {
    return items.filter((item: any) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-lg font-semibold">Failed to load items</p>
        <p className="text-muted-foreground text-sm">
          Please check your internet connection or API configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Items Master</h1>
          <p className="text-muted-foreground">
            Manage material and equipment inventory
          </p>
        </div>
        <Button onClick={() => navigate('/site/items/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Item
        </Button>
      </div>

      {/* Card */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredItems.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item: any) => (
                    <TableRow
                      key={item._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/site/items/${item._id}/view`)}
                    >
                      <TableCell className="font-medium">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>{item.uom}</TableCell>
                      <TableCell>{item.currentStock ?? 0}</TableCell>
                      <TableCell>{item.minStock ?? 'N/A'}</TableCell>
                      <TableCell>
                        {item.currentStock < (item.minStock ?? 0) ? (
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
                  ? 'No items match your search criteria.'
                  : 'Add items to track inventory.'
              }
              action={
                !searchQuery
                  ? {
                      label: 'Add Item',
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
