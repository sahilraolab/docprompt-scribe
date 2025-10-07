import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const item = {
    id: id,
    code: 'ITEM-001',
    name: 'Cement (50kg bags)',
    category: 'Building Materials',
    unit: 'Bags',
    hsnCode: '25232900',
    reorderLevel: 100,
    currentStock: 450,
    unitPrice: 350,
    status: 'Active',
  };

  const stockLevels = [
    { location: 'Mumbai Site 1', quantity: 200, status: 'Adequate' },
    { location: 'Mumbai Site 2', quantity: 150, status: 'Adequate' },
    { location: 'Central Warehouse', quantity: 100, status: 'Low Stock' },
  ];

  const transactions = [
    { id: 'TXN-001', date: '2024-01-15', type: 'GRN', quantity: 200, reference: 'GRN-001' },
    { id: 'TXN-002', date: '2024-01-16', type: 'Issue', quantity: -50, reference: 'ISS-001' },
    { id: 'TXN-003', date: '2024-01-18', type: 'Transfer', quantity: -30, reference: 'TRF-001' },
  ];

  const suppliers = [
    { name: 'ABC Materials', lastPrice: 350, lastOrderDate: '2024-01-10', rating: 4.5 },
    { name: 'XYZ Suppliers', lastPrice: 360, lastOrderDate: '2024-01-05', rating: 4.2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/site/items')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">{item.code} • {item.category}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/site/items/${id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Item
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock Levels</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Item Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Item Code</p>
                  <p className="font-medium">{item.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit</p>
                  <p className="font-medium">{item.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">HSN Code</p>
                  <p className="font-medium">{item.hsnCode}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Stock</p>
                  <p className="font-medium text-2xl">{item.currentStock} {item.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reorder Level</p>
                  <p className="font-medium">{item.reorderLevel} {item.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unit Price</p>
                  <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default">{item.status}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Stock by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockLevels.map((stock, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{stock.location}</TableCell>
                      <TableCell>{stock.quantity} {item.unit}</TableCell>
                      <TableCell>
                        <Badge variant={stock.status === 'Low Stock' ? 'destructive' : 'default'}>
                          {stock.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell>{formatDate(txn.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{txn.type}</Badge>
                      </TableCell>
                      <TableCell className={txn.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                        {txn.quantity > 0 ? '+' : ''}{txn.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="font-medium">{txn.reference}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Supplier History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Last Price</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliers.map((supplier, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{formatCurrency(supplier.lastPrice)}</TableCell>
                      <TableCell>{formatDate(supplier.lastOrderDate)}</TableCell>
                      <TableCell>{supplier.rating}/5</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
