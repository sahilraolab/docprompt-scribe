import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, FileText, FolderOpen, Calendar, Package, ListChecks, DollarSign, Download } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { projectsApi, estimatesApi, documentsApi, plansApi } from '@/lib/api/engineeringApi';
import { exportToCSV, exportToExcel, printElement, downloadJSON } from '@/lib/utils/export';

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
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [stats, setStats] = useState({ projects: 0, estimates: 0, documents: 0, totalBudget: 0 });

  useEffect(() => {
    (async () => {
      try {
        const [proj, est, docs] = await Promise.all([
          projectsApi.getAll(),
          estimatesApi.getAll(),
          documentsApi.getAll(),
        ]);
        const projects = proj.data || [];
        const estimates = est.data || [];
        const documents = docs.data || [];
        setProjectsData(projects);
        setEstimatesData(estimates);
        setDocumentsData(documents);
        const totalBudget = projects.reduce((sum: number, p: any) => sum + (p.budget || 0), 0);
        setStats({ projects: projects.length, estimates: estimates.length, documents: documents.length, totalBudget });
      } catch (e) {
        console.error('Failed to load engineering stats', e);
      }
    })();
  }, []);

  // Export helpers
  const getCombinedRows = () => {
    return [
      ...projectsData.map((p: any) => ({ type: 'Project', id: p.id, code: p.code, name: p.name, status: p.status, budget: p.budget })),
      ...estimatesData.map((e: any) => ({ type: 'Estimate', id: e.id, code: e.code, name: e.name || e.title, status: e.status, projectId: e.projectId })),
      ...documentsData.map((d: any) => ({ type: 'Document', id: d.id, code: d.code, name: d.name, projectId: d.projectId, typeLabel: d.type })),
    ];
  };

  const downloadTextFile = (content: string, filename: string, mime = 'application/xml') => {
    const blob = new Blob([content], { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMSPXml = () => {
    // Minimal MSPDI-like XML (tasks only)
    const tasks = projectsData.map((p: any, idx: number) => `
      <Task>
        <UID>${idx + 1}</UID>
        <ID>${idx + 1}</ID>
        <Name>${p.name || p.code}</Name>
        <Active>1</Active>
      </Task>
    `).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Engineering Export</Name>
  <Tasks>${tasks}</Tasks>
</Project>`;
    downloadTextFile(xml, 'engineering-msp.xml');
  };

  const exportP6Xml = () => {
    // Minimal Primavera P6-like XML (activities list)
    const activities = projectsData.map((p: any, idx: number) => `
      <Activity>
        <Id>${p.code || `ACT-${idx + 1}`}</Id>
        <Name>${p.name || p.code}</Name>
      </Activity>
    `).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Primavera>
  <Project>
    <Name>Engineering Export</Name>
    <Activities>${activities}</Activities>
  </Project>
</Primavera>`;
    downloadTextFile(xml, 'engineering-p6.xml');
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
      title: 'Documents',
      description: 'Drawings, reports, and files',
      icon: FolderOpen,
      path: '/engineering/documents',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Plans & Tasks',
      description: 'Project planning and task management',
      icon: Calendar,
      path: '/engineering/plans',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engineering</h1>
        <p className="text-muted-foreground mt-1">Project management and documentation</p>
      </div>

      {/* KPI Cards */}
      <div id="engineering-dashboard" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Active Projects"
          value={stats.projects}
          description="Current active projects"
          icon={Building}
          trend={{ value: 5, isPositive: true }}
        />
        <KPICard
          title="Total Budget"
          value={formatCurrency(stats.totalBudget, 'short')}
          description="All projects"
          icon={DollarSign}
        />
        <KPICard
          title="Materials"
          value="1,248"
          description="In master database"
          icon={Package}
        />
        <KPICard
          title="Documents"
          value={stats.documents}
          description="Uploaded"
          icon={FolderOpen}
        />
      </div>

      {/* Exports */}
      <Card>
        <CardHeader>
          <CardTitle>Exports</CardTitle>
          <CardDescription>Download engineering data in common formats</CardDescription>
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
              <Download className="mr-2 h-4 w-4" /> PDF (Print)
            </Button>
            <Button variant="outline" onClick={exportMSPXml}>
              <Download className="mr-2 h-4 w-4" /> MSP XML
            </Button>
            <Button variant="outline" onClick={exportP6Xml}>
              <Download className="mr-2 h-4 w-4" /> P6 XML
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
