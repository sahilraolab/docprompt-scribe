import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, FileText, FolderOpen, Calendar, Package, ListChecks, DollarSign, Download, TrendingUp } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { projectsApi, estimatesApi, boqApi } from '@/lib/api/engineeringApi';
import { materialMasterApi } from '@/lib/api/materialMasterApi';
import { exportToCSV, exportToExcel, printElement } from '@/lib/utils/export';

export default function EngineeringIndex() {
  const navigate = useNavigate();

  // Basic SEO
  useEffect(() => {
    document.title = 'Engineering Dashboard | ERP';
    const desc = 'Engineering module overview, KPIs, and data exports (CSV, Excel, PDF, MSP, P6).';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', desc);
    else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  // Data state
  const [projectsData, setProjectsData] = useState<any[]>([]);
  const [estimatesData, setEstimatesData] = useState<any[]>([]);
  const [boqData, setBOQData] = useState<any[]>([]);
  const [materialsData, setMaterialsData] = useState<any[]>([]);
  
  // Stats state
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    pendingEstimates: 0,
    totalMaterials: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [proj, est, boq, materials] = await Promise.all([
          projectsApi.getAll(),
          estimatesApi.getAll(),
          boqApi.getAll(),
          materialMasterApi.getAll(),
        ]);
        
        const projects = proj.data || [];
        const estimates = est.data || [];
        const boqArr = boq.data || [];
        const materialsArr = materials.data || [];
        
        setProjectsData(projects);
        setEstimatesData(estimates);
        setBOQData(boqArr);
        setMaterialsData(materialsArr);
        
        calculateStats(projects, estimates, materialsArr);
      } catch (e) {
        console.error('Failed to load engineering stats', e);
      }
    })();
  }, []);

  const calculateStats = (projects: any[], estimates: any[], materials: any[]) => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const pendingEstimates = estimates.filter(e => e.status === 'Pending').length;

    setStats({
      totalProjects: projects.length,
      activeProjects,
      totalBudget,
      totalSpent,
      pendingEstimates,
      totalMaterials: materials.length,
    });
  };

  // Export helpers
  const getCombinedRows = () => {
    return [
      ...projectsData.map((p: any) => ({
        type: 'Project',
        id: p.id,
        code: p.code,
        name: p.name,
        city: p.city,
        status: p.status,
        budget: p.budget,
        spent: p.spent,
        progress: p.progress,
        startDate: p.startDate,
        endDate: p.endDate,
      })),
      ...estimatesData.map((e: any) => ({
        type: 'Estimate',
        id: e.id,
        projectId: e.projectId,
        version: e.version,
        status: e.status,
        total: e.total,
      })),
      ...boqData.map((b: any) => ({
        type: 'BOQ',
        id: b.id,
        projectId: b.projectId,
        version: b.version,
        status: b.status,
        totalCost: b.totalCost,
      })),
    ];
  };

  const modules = [
    {
      title: 'Projects',
      description: 'Manage construction projects',
      icon: Building,
      path: '/engineering/projects',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Material Master',
      description: 'Master database for all materials',
      icon: Package,
      path: '/engineering/materials',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'BOQ',
      description: 'Bill of Quantities management',
      icon: ListChecks,
      path: '/engineering/boq',
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
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
      icon: Download,
      path: '/engineering/compliance',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Documents',
      description: 'Drawings, reports, and files',
      icon: FolderOpen,
      path: '/engineering/documents',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Plans & Tasks',
      description: 'Project planning and task management',
      icon: Calendar,
      path: '/engineering/plans',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engineering Dashboard</h1>
        <p className="text-muted-foreground mt-1">Comprehensive project management and analytics</p>
      </div>

      {/* KPI Cards */}
      <div id="engineering-dashboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Projects"
          value={stats.totalProjects}
          description={`${stats.activeProjects} active`}
          icon={Building}
          trend={{ value: stats.activeProjects, isPositive: true }}
        />
        <KPICard
          title="Total Budget"
          value={formatCurrency(stats.totalBudget, 'short')}
          description="All projects"
          icon={DollarSign}
        />
        <KPICard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent, 'short')}
          description="Across projects"
          icon={TrendingUp}
        />
        <KPICard
          title="Pending Estimates"
          value={stats.pendingEstimates}
          description="Awaiting approval"
          icon={FileText}
        />
        <KPICard
          title="Materials"
          value={stats.totalMaterials}
          description="Master database"
          icon={Package}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Latest projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projectsData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects available</p>
            ) : (
              <div className="space-y-3">
                {projectsData.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{project.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {project.code} • {project.status}
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(project.budget || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                        <span className="text-sm font-medium">Version {estimate.version}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {estimate.status}
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(estimate.total || 0)}</span>
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
