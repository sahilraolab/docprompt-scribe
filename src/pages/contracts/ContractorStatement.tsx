import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ArrowLeft, Download, Loader2, FileText, Receipt, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import { useContractor, useWorkOrders, useRABills, useAdvances, useDCNotes } from '@/lib/hooks/useContracts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportData } from '@/lib/utils/export-enhanced';

export default function ContractorStatement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: contractor, isLoading: loadingContractor } = useContractor(id);
  const { data: allWorkOrders = [], isLoading: loadingWOs } = useWorkOrders({ contractorId: id });
  const { data: allRABills = [], isLoading: loadingBills } = useRABills({ contractorId: id });
  const { data: allAdvances = [], isLoading: loadingAdvances } = useAdvances({ contractorId: id });
  const { data: allDCNotes = [], isLoading: loadingDCNotes } = useDCNotes({ contractorId: id });

  // Filter by contractor
  const workOrders = allWorkOrders.filter((wo: any) => 
    wo.contractorId?._id === id || wo.contractorId === id
  );
  const raBills = allRABills.filter((bill: any) => 
    bill.workOrderId?.contractorId?._id === id || bill.workOrderId?.contractorId === id
  );
  const advances = allAdvances.filter((adv: any) => 
    adv.contractorId?._id === id || adv.contractorId === id
  );
  const dcNotes = allDCNotes.filter((note: any) => 
    note.contractorId?._id === id || note.contractorId === id
  );

  // Calculate totals
  const totalWOValue = workOrders.reduce((sum: number, wo: any) => sum + (wo.amount || 0), 0);
  const totalRABillsGross = raBills.reduce((sum: number, bill: any) => sum + (bill.gross || 0), 0);
  const totalRABillsNet = raBills.reduce((sum: number, bill: any) => sum + (bill.net || 0), 0);
  const totalAdvances = advances.reduce((sum: number, adv: any) => sum + (adv.amount || 0), 0);
  const totalDebitNotes = dcNotes.filter((n: any) => n.type === 'Debit').reduce((sum: number, n: any) => sum + (n.amount || 0), 0);
  const totalCreditNotes = dcNotes.filter((n: any) => n.type === 'Credit').reduce((sum: number, n: any) => sum + (n.amount || 0), 0);

  const balanceDue = totalRABillsNet - totalAdvances + totalCreditNotes - totalDebitNotes;

  const handleExport = () => {
    const transactions = [
      ...raBills.map((bill: any) => ({
        Date: formatDate(bill.billDate),
        Type: 'RA Bill',
        Reference: bill.billNo,
        Debit: bill.net || 0,
        Credit: 0,
      })),
      ...advances.map((adv: any) => ({
        Date: formatDate(adv.paidAt),
        Type: 'Advance',
        Reference: `ADV-${adv.id}`,
        Debit: 0,
        Credit: adv.amount || 0,
      })),
      ...dcNotes.map((note: any) => ({
        Date: formatDate(note.date),
        Type: `${note.type} Note`,
        Reference: note.code,
        Debit: note.type === 'Credit' ? note.amount : 0,
        Credit: note.type === 'Debit' ? note.amount : 0,
      })),
    ];
    exportData(transactions, { filename: `contractor-statement-${contractor?.name || id}`, format: 'csv' });
  };

  const isLoading = loadingContractor || loadingWOs || loadingBills || loadingAdvances || loadingDCNotes;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Contractor Not Found</h2>
        <Button onClick={() => navigate('/contracts/contractors')}>Back to Contractors</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/contracts/contractors')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{contractor.name}</h1>
            <p className="text-muted-foreground">Contractor Statement of Account</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Statement
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total WO Value</p>
                <p className="text-xl font-bold">{formatCurrency(totalWOValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Receipt className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">RA Bills (Net)</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalRABillsNet)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Advances Paid</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(totalAdvances)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={balanceDue > 0 ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${balanceDue > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {balanceDue > 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{balanceDue > 0 ? 'Balance Due' : 'Overpaid'}</p>
                <p className={`text-xl font-bold ${balanceDue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(balanceDue))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different transaction types */}
      <Tabs defaultValue="work-orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="work-orders">Work Orders ({workOrders.length})</TabsTrigger>
          <TabsTrigger value="ra-bills">RA Bills ({raBills.length})</TabsTrigger>
          <TabsTrigger value="advances">Advances ({advances.length})</TabsTrigger>
          <TabsTrigger value="dc-notes">Debit/Credit Notes ({dcNotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders">
          <Card>
            <CardHeader>
              <CardTitle>Work Orders</CardTitle>
              <CardDescription>All work orders for this contractor</CardDescription>
            </CardHeader>
            <CardContent>
              {workOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((wo: any) => (
                      <TableRow key={wo._id} className="cursor-pointer" onClick={() => navigate(`/contracts/work-orders/${wo._id}`)}>
                        <TableCell className="font-medium">{wo.code}</TableCell>
                        <TableCell>{wo.projectId?.name || 'N/A'}</TableCell>
                        <TableCell>{formatDate(wo.startDate)}</TableCell>
                        <TableCell>{formatCurrency(wo.amount)}</TableCell>
                        <TableCell>{wo.progress || 0}%</TableCell>
                        <TableCell><StatusBadge status={wo.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No work orders found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ra-bills">
          <Card>
            <CardHeader>
              <CardTitle>RA Bills</CardTitle>
              <CardDescription>Running account bills submitted</CardDescription>
            </CardHeader>
            <CardContent>
              {raBills.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bill No</TableHead>
                      <TableHead>WO Code</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Retention</TableHead>
                      <TableHead>Net</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {raBills.map((bill: any) => (
                      <TableRow key={bill._id}>
                        <TableCell className="font-medium">{bill.billNo}</TableCell>
                        <TableCell>{bill.workOrderId?.code || 'N/A'}</TableCell>
                        <TableCell>{formatDate(bill.fromDate)} - {formatDate(bill.toDate)}</TableCell>
                        <TableCell>{formatCurrency(bill.gross)}</TableCell>
                        <TableCell className="text-destructive">-{formatCurrency(bill.retention)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(bill.net)}</TableCell>
                        <TableCell><StatusBadge status={bill.status || 'Pending'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No RA bills found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advances">
          <Card>
            <CardHeader>
              <CardTitle>Advances</CardTitle>
              <CardDescription>Advance payments made to contractor</CardDescription>
            </CardHeader>
            <CardContent>
              {advances.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advances.map((adv: any) => (
                      <TableRow key={adv._id}>
                        <TableCell>{formatDate(adv.paidAt)}</TableCell>
                        <TableCell>{adv.woCode || 'General'}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(adv.amount)}</TableCell>
                        <TableCell>{formatCurrency(adv.balance || 0)}</TableCell>
                        <TableCell><StatusBadge status={adv.status || 'Paid'} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No advances found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dc-notes">
          <Card>
            <CardHeader>
              <CardTitle>Debit/Credit Notes</CardTitle>
              <CardDescription>Adjustments and corrections</CardDescription>
            </CardHeader>
            <CardContent>
              {dcNotes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dcNotes.map((note: any) => (
                      <TableRow key={note._id}>
                        <TableCell className="font-medium">{note.code}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${note.type === 'Credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {note.type}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(note.date)}</TableCell>
                        <TableCell className={note.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
                          {note.type === 'Credit' ? '+' : '-'}{formatCurrency(note.amount)}
                        </TableCell>
                        <TableCell>{note.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No debit/credit notes found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
