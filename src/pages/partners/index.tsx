import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, Building2, Receipt, Percent, Download, Clock } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { usePartners, useInvestments, useProfitEvents, useDistributions } from '@/lib/hooks/usePartners';
import { exportToCSV } from '@/lib/utils/export';

export default function PartnersIndex() {
  const navigate = useNavigate();
  const { data: partners = [], isLoading: loadingPartners } = usePartners();
  const { data: investments = [], isLoading: loadingInvestments } = useInvestments();
  const { data: profitEvents = [], isLoading: loadingProfits } = useProfitEvents();
  const { data: distributions = [], isLoading: loadingDistributions } = useDistributions();

  const activePartners = partners.filter((p: any) => p.status === 'active').length;
  const totalInvestment = investments.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
  const totalProfit = profitEvents.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  const pendingDistributions = distributions.filter((d: any) => d.status === 'pending').length;

  const handleExport = () => {
    const data = [
      { Module: 'Partners', Total: partners.length, Active: activePartners },
      { Module: 'Investments', Total: investments.length, Amount: totalInvestment },
      { Module: 'Profit Events', Total: profitEvents.length, Amount: totalProfit },
      { Module: 'Distributions', Total: distributions.length, Pending: pendingDistributions },
    ];
    exportToCSV(data, `partners-overview-${new Date().toISOString().split('T')[0]}`);
  };

  const modules = [
    {
      title: 'Partners',
      description: 'Manage investors and partners',
      icon: Users,
      path: '/partners/list',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Project Investments',
      description: 'Capital contributions and shares',
      icon: Building2,
      path: '/partners/investments',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Profit Events',
      description: 'Track and distribute profits',
      icon: TrendingUp,
      path: '/partners/profit-events',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Distributions',
      description: 'Partner payout history',
      icon: Receipt,
      path: '/partners/distributions',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  const recentInvestments = investments.slice(0, 5);
  const recentProfitEvents = profitEvents.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partners & Investments</h1>
          <p className="text-muted-foreground mt-1">Manage partners, investments and profit distributions</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={loadingPartners}>
          <Download className="h-4 w-4 mr-2" />
          Export Overview
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Partners"
          value={loadingPartners ? '...' : activePartners.toString()}
          description="Registered partners"
          icon={Users}
        />
        <KPICard
          title="Total Investment"
          value={loadingInvestments ? '...' : formatCurrency(totalInvestment, 'short')}
          description="Across all projects"
          icon={DollarSign}
        />
        <KPICard
          title="Total Profit"
          value={loadingProfits ? '...' : formatCurrency(totalProfit, 'short')}
          description="All profit events"
          icon={TrendingUp}
        />
        <KPICard
          title="Pending Distributions"
          value={loadingDistributions ? '...' : pendingDistributions.toString()}
          description="Awaiting approval"
          icon={Clock}
        />
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Investments</CardTitle>
            <CardDescription>Latest capital contributions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInvestments.length > 0 ? (
              <div className="space-y-3">
                {recentInvestments.map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/partners/investments/${inv.id}`)}>
                    <div>
                      <p className="font-medium">{inv.projectName}</p>
                      <p className="text-sm text-muted-foreground">{inv.partnerName}</p>
                    </div>
                    <span className="font-medium">{formatCurrency(inv.amount || 0, 'short')}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No investments found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Profit Events</CardTitle>
            <CardDescription>Latest profit distributions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProfitEvents.length > 0 ? (
              <div className="space-y-3">
                {recentProfitEvents.map((pe: any) => (
                  <div key={pe.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => navigate(`/partners/profit-events/${pe.id}`)}>
                    <div>
                      <p className="font-medium">{pe.projectName}</p>
                      <p className="text-sm text-muted-foreground">{pe.eventType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{formatCurrency(pe.amount || 0, 'short')}</p>
                      <span className={`text-xs px-2 py-1 rounded ${pe.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {pe.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No profit events found</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all border-t-4 hover:border-t-primary"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`p-4 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-8 w-8 ${module.color}`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
