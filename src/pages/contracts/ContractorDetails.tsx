import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function ContractorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data
  const contractor = {
    id: id,
    code: 'CON-001',
    name: 'XYZ Contractors',
    specialization: 'Civil Works',
    contactPerson: 'Amit Patel',
    email: 'amit@xyzcontractors.com',
    phone: '+91 98765 12345',
    address: 'Shop 45, Contractor Market, Mumbai',
    gstNumber: '27XYZAB1234C1Z5',
    panNumber: 'XYZAB1234C',
    rating: 4.2,
    status: 'Active',
  };

  const workOrders = [
    { id: 'WO-001', date: '2024-01-10', title: 'Foundation Work', amount: 1500000, status: 'In Progress' },
    { id: 'WO-002', date: '2024-01-15', title: 'Structural Steel Work', amount: 2200000, status: 'Completed' },
    { id: 'WO-003', date: '2024-01-20', title: 'Plastering Work', amount: 850000, status: 'Pending' },
  ];

  const raBills = [
    { id: 'RA-001', date: '2024-01-12', woNumber: 'WO-001', amount: 750000, status: 'Approved' },
    { id: 'RA-002', date: '2024-01-18', woNumber: 'WO-002', amount: 1100000, status: 'Pending' },
  ];

  const performance = {
    totalWorkOrders: 28,
    completionRate: 89,
    qualityRating: 4.2,
    totalContractValue: 45000000,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/contractors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contractor.name}</h1>
            <p className="text-muted-foreground">{contractor.code} • {contractor.specialization}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/contracts/contractors/${id}`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Contractor
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="bills">RA Bills</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{contractor.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{contractor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{contractor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{contractor.address}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Specialization</p>
                  <p className="font-medium">{contractor.specialization}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GST Number</p>
                  <p className="font-medium">{contractor.gstNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PAN Number</p>
                  <p className="font-medium">{contractor.panNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">{contractor.rating}/5</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workorders">
          <Card>
            <CardHeader>
              <CardTitle>Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>WO Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">{wo.id}</TableCell>
                      <TableCell>{formatDate(wo.date)}</TableCell>
                      <TableCell>{wo.title}</TableCell>
                      <TableCell>{formatCurrency(wo.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={wo.status === 'Completed' ? 'default' : 'secondary'}>
                          {wo.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle>RA Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>WO Number</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.id}</TableCell>
                      <TableCell>{formatDate(bill.date)}</TableCell>
                      <TableCell>{bill.woNumber}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={bill.status === 'Approved' ? 'default' : 'secondary'}>
                          {bill.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Work Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{performance.totalWorkOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{performance.completionRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quality Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{performance.qualityRating}/5</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Contract Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(performance.totalContractValue)}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
