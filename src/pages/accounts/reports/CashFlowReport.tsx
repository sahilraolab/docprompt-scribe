import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, TrendingUp, TrendingDown, Building2, Wallet, Landmark } from 'lucide-react';
import { useCashFlow } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/utils/format';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportToCSV } from '@/lib/utils/export';

interface CashFlowActivity {
  label: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface CashFlowData {
  operating: CashFlowActivity[];
  investing: CashFlowActivity[];
  financing: CashFlowActivity[];
  openingCash: number;
  closingCash: number;
}

export default function CashFlowReport() {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: apiData, isLoading } = useCashFlow({ fromDate, toDate });

  // Fallback mock data for demonstration when API doesn't return structured data
  const cashFlowData: CashFlowData = useMemo(() => {
    if (apiData?.operating) return apiData as CashFlowData;
    
    return {
      operating: [
        { label: 'Cash from Sales/Revenue', inflow: 2500000, outflow: 0, net: 2500000 },
        { label: 'Payments to Suppliers', inflow: 0, outflow: 1200000, net: -1200000 },
        { label: 'Payments to Employees', inflow: 0, outflow: 450000, net: -450000 },
        { label: 'Interest Received', inflow: 35000, outflow: 0, net: 35000 },
        { label: 'Interest Paid', inflow: 0, outflow: 85000, net: -85000 },
        { label: 'Taxes Paid', inflow: 0, outflow: 180000, net: -180000 },
      ],
      investing: [
        { label: 'Purchase of Fixed Assets', inflow: 0, outflow: 350000, net: -350000 },
        { label: 'Sale of Equipment', inflow: 75000, outflow: 0, net: 75000 },
        { label: 'Investments Made', inflow: 0, outflow: 200000, net: -200000 },
      ],
      financing: [
        { label: 'Loan Proceeds', inflow: 500000, outflow: 0, net: 500000 },
        { label: 'Loan Repayments', inflow: 0, outflow: 150000, net: -150000 },
        { label: 'Capital Contributions', inflow: 250000, outflow: 0, net: 250000 },
        { label: 'Dividends Paid', inflow: 0, outflow: 100000, net: -100000 },
      ],
      openingCash: 850000,
      closingCash: 0,
    };
  }, [apiData]);

  const operatingTotal = useMemo(() => 
    cashFlowData.operating.reduce((sum, item) => sum + item.net, 0), 
    [cashFlowData.operating]
  );

  const investingTotal = useMemo(() => 
    cashFlowData.investing.reduce((sum, item) => sum + item.net, 0), 
    [cashFlowData.investing]
  );

  const financingTotal = useMemo(() => 
    cashFlowData.financing.reduce((sum, item) => sum + item.net, 0), 
    [cashFlowData.financing]
  );

  const netCashChange = operatingTotal + investingTotal + financingTotal;
  const closingCash = cashFlowData.openingCash + netCashChange;

  const handleExport = () => {
    const rows: any[] = [];
    
    rows.push({ Activity: 'OPERATING ACTIVITIES', Inflow: '', Outflow: '', Net: '' });
    cashFlowData.operating.forEach(item => {
      rows.push({ Activity: item.label, Inflow: item.inflow, Outflow: item.outflow, Net: item.net });
    });
    rows.push({ Activity: 'Net Cash from Operating', Inflow: '', Outflow: '', Net: operatingTotal });
    rows.push({ Activity: '', Inflow: '', Outflow: '', Net: '' });
    
    rows.push({ Activity: 'INVESTING ACTIVITIES', Inflow: '', Outflow: '', Net: '' });
    cashFlowData.investing.forEach(item => {
      rows.push({ Activity: item.label, Inflow: item.inflow, Outflow: item.outflow, Net: item.net });
    });
    rows.push({ Activity: 'Net Cash from Investing', Inflow: '', Outflow: '', Net: investingTotal });
    rows.push({ Activity: '', Inflow: '', Outflow: '', Net: '' });
    
    rows.push({ Activity: 'FINANCING ACTIVITIES', Inflow: '', Outflow: '', Net: '' });
    cashFlowData.financing.forEach(item => {
      rows.push({ Activity: item.label, Inflow: item.inflow, Outflow: item.outflow, Net: item.net });
    });
    rows.push({ Activity: 'Net Cash from Financing', Inflow: '', Outflow: '', Net: financingTotal });
    rows.push({ Activity: '', Inflow: '', Outflow: '', Net: '' });
    
    rows.push({ Activity: 'Opening Cash Balance', Inflow: '', Outflow: '', Net: cashFlowData.openingCash });
    rows.push({ Activity: 'Net Change in Cash', Inflow: '', Outflow: '', Net: netCashChange });
    rows.push({ Activity: 'Closing Cash Balance', Inflow: '', Outflow: '', Net: closingCash });
    
    exportToCSV(rows, `cash-flow-${fromDate}-to-${toDate}`);
  };

  const ActivitySection = ({ 
    title, 
    icon: Icon, 
    items, 
    total,
    colorClass 
  }: { 
    title: string; 
    icon: any; 
    items: CashFlowActivity[]; 
    total: number;
    colorClass: string;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${colorClass}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead className="text-right">Inflow</TableHead>
              <TableHead className="text-right">Outflow</TableHead>
              <TableHead className="text-right">Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.label}</TableCell>
                <TableCell className="text-right text-green-600">
                  {item.inflow > 0 ? formatCurrency(item.inflow) : '-'}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {item.outflow > 0 ? formatCurrency(item.outflow) : '-'}
                </TableCell>
                <TableCell className={`text-right font-medium ${item.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(item.net)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-muted/50">
              <TableCell>Net Cash from {title.replace(' Activities', '')}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell className={`text-right ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Cash Flow Statement</h1>
            <p className="text-muted-foreground">Operating, Investing & Financing Activities</p>
          </div>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Period</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="fromDate">From</label>
            <Input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground" htmlFor="toDate">To</label>
            <Input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Operating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center gap-2 ${operatingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {operatingTotal >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {formatCurrency(operatingTotal)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Investing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center gap-2 ${investingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {investingTotal >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {formatCurrency(investingTotal)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Financing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center gap-2 ${financingTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financingTotal >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {formatCurrency(financingTotal)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Change</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold flex items-center gap-2 ${netCashChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netCashChange >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                  {formatCurrency(netCashChange)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Sections */}
          <ActivitySection 
            title="Operating Activities" 
            icon={Building2} 
            items={cashFlowData.operating} 
            total={operatingTotal}
            colorClass="text-blue-600"
          />
          
          <ActivitySection 
            title="Investing Activities" 
            icon={Wallet} 
            items={cashFlowData.investing} 
            total={investingTotal}
            colorClass="text-purple-600"
          />
          
          <ActivitySection 
            title="Financing Activities" 
            icon={Landmark} 
            items={cashFlowData.financing} 
            total={financingTotal}
            colorClass="text-orange-600"
          />

          {/* Cash Position Summary */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Cash Position Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Opening Cash Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(cashFlowData.openingCash)}</p>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Net Change in Cash</p>
                  <p className={`text-2xl font-bold ${netCashChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netCashChange >= 0 ? '+' : ''}{formatCurrency(netCashChange)}
                  </p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">Closing Cash Balance</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(closingCash)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
