import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { useContractor, useWorkOrders, useRABills } from '@/lib/hooks/useContracts';
import { StatusBadge } from '@/components/StatusBadge';

export default function ContractorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: contractor, isLoading: contractorLoading } = useContractor(id);
  const { data: workOrders = [] } = useWorkOrders({ contractorId: id });
  const { data: raBills = [] } = useRABills({ contractorId: id });

  if (contractorLoading || !contractor) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalContractValue = workOrders.reduce((sum: number, wo: any) => sum + (wo.amount || 0), 0);
  const completedWOs = workOrders.filter((wo: any) => wo.status === 'Completed').length;
  const completionRate = workOrders.length > 0 ? Math.round((completedWOs / workOrders.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/contractors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contractor.name}</h1>
            <p className="text-muted-foreground">{contractor.code} • {contractor.specialization || 'General Contractor'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/contracts/contractors/${id}/statement`)}>
            <FileText className="h-4 w-4 mr-2" />
            View Statement
          </Button>
          <Button onClick={() => navigate(`/contracts/contractors/${id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Contractor
          </Button>
        </div>
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
                  <p className="font-medium">{contractor.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{contractor.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{contractor.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{contractor.address || 'N/A'}</p>
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
                  <p className="font-medium">{contractor.specialization || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GST Number</p>
                  <p className="font-medium">{contractor.gst || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PAN Number</p>
                  <p className="font-medium">{contractor.pan || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">{contractor.rating ? `${contractor.rating}/5` : 'N/A'}</p>
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
                    <TableRow key={wo._id} className="cursor-pointer" onClick={() => navigate(`/contracts/work-orders/${wo._id}`)}>
                      <TableCell className="font-medium">{wo.code}</TableCell>
                      <TableCell>{formatDate(wo.woDate)}</TableCell>
                      <TableCell>{wo.workDescription?.substring(0, 50)}...</TableCell>
                      <TableCell>{formatCurrency(wo.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge status={wo.status} />
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
                    <TableRow key={bill._id} className="cursor-pointer" onClick={() => navigate(`/contracts/ra-bills/${bill._id}`)}>
                      <TableCell className="font-medium">{bill.billNo}</TableCell>
                      <TableCell>{formatDate(bill.billDate)}</TableCell>
                      <TableCell>{bill.workOrderId?.code || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(bill.net)}</TableCell>
                      <TableCell>
                        <StatusBadge status={bill.status || 'Pending'} />
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
                <p className="text-3xl font-bold">{workOrders.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{completionRate}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quality Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{contractor.rating ? `${contractor.rating}/5` : 'N/A'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Contract Value</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(totalContractValue)}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
