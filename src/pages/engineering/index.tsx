import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ListChecks, DollarSign, Download, TrendingUp, FolderOpen, Shield, Building } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { estimatesApi, bbsApi, drawingsApi, complianceApi } from '@/lib/api/engineeringApi';
import { projectsApi } from '@/lib/api/mastersApi';
import { exportToCSV, exportToExcel, printElement } from '@/lib/utils/export';

export default function EngineeringIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Engineering Dashboard | ERP';
  }, []);

  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [estimatesData, setEstimatesData] = useState<any[]>([]);
  const [bbsData, setBBSData] = useState<any[]>([]);
  const [drawingsData, setDrawingsData] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalBudget: 0,
    totalEstimates: 0,
    totalBBS: 0,
    totalDrawings: 0,
    draftEstimates: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [projRes, estRes, bbsRes, drawRes] = await Promise.all([
          projectsApi.getAll(),
          estimatesApi.getAll(),
          bbsApi.getAll(),
          drawingsApi.getAll(),
        ]);
        
        // Masters API returns data directly, engineering API returns { success, data }
        const projects = Array.isArray(projRes) ? projRes : ((projRes as any)?.data || []);
        const estimates = (estRes as any)?.data || [];
        const bbs = (bbsRes as any)?.data || [];
        const drawings = (drawRes as any)?.data || [];
        
        setProjectsData(projects);
        setEstimatesData(estimates);
        setBBSData(bbs);
        setDrawingsData(drawings);
        
        const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
        const draftEstimates = estimates.filter((e: any) => e.status === 'DRAFT').length;

        setStats({
          totalProjects: projects.length,
          totalBudget,
          totalEstimates: estimates.length,
          totalBBS: bbs.length,
          totalDrawings: drawings.length,
          draftEstimates,
        });
      } catch (e) {
        console.error('Failed to load engineering stats', e);
      }
    })();
  }, []);

  const getCombinedRows = () => {
    return [
      ...estimatesData.map((e: any) => ({
        type: 'Estimate',
        id: e.id,
        projectId: e.projectId,
        name: e.name,
        status: e.status,
        baseAmount: e.baseAmount,
      })),
      ...bbsData.map((b: any) => ({
        type: 'BBS',
        id: b.id,
        code: b.code,
        description: b.description,
        quantity: b.quantity,
        rate: b.rate,
        amount: b.amount,
        status: b.status,
      })),
    ];
  };

  const modules = [
    {
      title: 'Estimates',
      description: 'Project cost estimates with versioning',
      icon: FileText,
      path: '/engineering/estimates',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'BBS',
      description: 'Bar Bending Schedule for reinforcement',
      icon: TrendingUp,
      path: '/engineering/bbs',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Budget',
      description: 'Project budget allocation & tracking',
      icon: DollarSign,
      path: '/engineering/budget',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Drawings',
      description: 'Engineering drawings & revisions',
      icon: FolderOpen,
      path: '/engineering/drawings',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Compliance',
      description: 'Regulatory compliance tracking',
      icon: Shield,
      path: '/engineering/compliance',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engineering Dashboard</h1>
        <p className="text-muted-foreground mt-1">Engineering module overview</p>
      </div>

      {/* KPI Cards */}
      <div id="engineering-dashboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Projects"
          value={stats.totalProjects}
          description="From Masters"
          icon={Building}
        />
        <KPICard
          title="Total Budget"
          value={formatCurrency(stats.totalBudget, 'short')}
          description="All projects"
          icon={DollarSign}
        />
        <KPICard
          title="Estimates"
          value={stats.totalEstimates}
          description={`${stats.draftEstimates} draft`}
          icon={FileText}
        />
        <KPICard
          title="BBS Records"
          value={stats.totalBBS}
          description="Bar bending schedules"
          icon={TrendingUp}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Estimates</CardTitle>
            <CardDescription>Latest cost estimates</CardDescription>
          </CardHeader>
          <CardContent>
            {estimatesData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No estimates available</p>
            ) : (
              <div className="space-y-3">
                {estimatesData.slice(0, 5).map((estimate: any) => (
                  <div key={estimate.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{estimate.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {estimate.status}
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(estimate.baseAmount || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Drawings</CardTitle>
            <CardDescription>Latest engineering drawings</CardDescription>
          </CardHeader>
          <CardContent>
            {drawingsData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No drawings available</p>
            ) : (
              <div className="space-y-3">
                {drawingsData.slice(0, 5).map((drawing: any) => (
                  <div key={drawing.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{drawing.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {drawing.drawingNo} • {drawing.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Exports</CardTitle>
          <CardDescription>Download engineering data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" onClick={() => exportToCSV(getCombinedRows(), 'engineering-data')}>
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button variant="secondary" onClick={() => exportToExcel(getCombinedRows(), 'engineering-data')}>
              <Download className="mr-2 h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => printElement('engineering-dashboard')}>
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{module.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">{module.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
