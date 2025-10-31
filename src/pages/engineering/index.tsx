import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, FileText, FolderOpen, Calendar, Package, ListChecks, DollarSign, Download, Filter, TrendingUp, AlertTriangle } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { formatCurrency } from '@/lib/utils/format';
import { projectsApi, estimatesApi, documentsApi, plansApi, boqApi } from '@/lib/api/engineeringApi';
import { materialMasterApi } from '@/lib/api/materialMasterApi';
import { exportToCSV, exportToExcel, printElement } from '@/lib/utils/export';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

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
  const [plansData, setPlansData] = useState<any[]>([]);
  const [boqData, setBOQData] = useState<any[]>([]);
  const [materialsData, setMaterialsData] = useState<any[]>([]);
  
  // Filter state
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  
  // Stats state
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalBudget: 0,
    totalSpent: 0,
    budgetUtilization: 0,
    avgProgress: 0,
    pendingEstimates: 0,
    approvedEstimates: 0,
    totalMaterials: 0,
    totalDocuments: 0,
    totalPlans: 0,
    onTimeProjects: 0,
    delayedProjects: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [proj, est, docs, plans, boq, materials] = await Promise.all([
          projectsApi.getAll(),
          estimatesApi.getAll(),
          documentsApi.getAll(),
          plansApi.getAll(),
          boqApi.getAll(),
          materialMasterApi.getAll(),
        ]);
        
        const projects = proj.data || [];
        const estimates = est.data || [];
        const documents = docs.data || [];
        const plansArr = plans.data || [];
        const boqArr = boq.data || [];
        const materialsArr = materials.data || [];
        
        setProjectsData(projects);
        setEstimatesData(estimates);
        setDocumentsData(documents);
        setPlansData(plansArr);
        setBOQData(boqArr);
        setMaterialsData(materialsArr);
        
        calculateStats(projects, estimates, documents, plansArr, boqArr, materialsArr);
      } catch (e) {
        console.error('Failed to load engineering stats', e);
      }
    })();
  }, []);

  // Recalculate stats when filters change
  useEffect(() => {
    const filtered = getFilteredData();
    calculateStats(
      filtered.projects,
      filtered.estimates,
      filtered.documents,
      filtered.plans,
      filtered.boq,
      filtered.materials
    );
  }, [dateFrom, dateTo, statusFilter, cityFilter, projectsData, estimatesData, documentsData, plansData, boqData, materialsData]);

  const getFilteredData = () => {
    let filteredProjects = [...projectsData];
    let filteredEstimates = [...estimatesData];
    let filteredDocuments = [...documentsData];
    let filteredPlans = [...plansData];
    let filteredBOQ = [...boqData];
    let filteredMaterials = [...materialsData];

    // Date filter
    if (dateFrom) {
      const fromTime = dateFrom.getTime();
      filteredProjects = filteredProjects.filter((p: any) => {
        const startTime = new Date(p.startDate).getTime();
        return startTime >= fromTime;
      });
    }
    if (dateTo) {
      const toTime = dateTo.getTime();
      filteredProjects = filteredProjects.filter((p: any) => {
        const startTime = new Date(p.startDate).getTime();
        return startTime <= toTime;
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      filteredProjects = filteredProjects.filter((p: any) => p.status === statusFilter);
    }

    // City filter
    if (cityFilter !== 'all') {
      filteredProjects = filteredProjects.filter((p: any) => (p.location || p.city) === cityFilter);
    }

    // Filter related data based on filtered projects
    const projectIds = new Set(filteredProjects.map((p: any) => p.id));
    filteredEstimates = filteredEstimates.filter((e: any) => projectIds.has(e.projectId));
    filteredDocuments = filteredDocuments.filter((d: any) => projectIds.has(d.projectId));
    filteredPlans = filteredPlans.filter((p: any) => projectIds.has(p.projectId));
    filteredBOQ = filteredBOQ.filter((b: any) => projectIds.has(b.projectId));

    return {
      projects: filteredProjects,
      estimates: filteredEstimates,
      documents: filteredDocuments,
      plans: filteredPlans,
      boq: filteredBOQ,
      materials: filteredMaterials,
    };
  };

  const calculateStats = (
    projects: any[],
    estimates: any[],
    documents: any[],
    plans: any[],
    boq: any[],
    materials: any[]
  ) => {
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    const avgProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length 
      : 0;
    
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const pendingEstimates = estimates.filter(e => e.status === 'Pending').length;
    const approvedEstimates = estimates.filter(e => e.status === 'Approved').length;
    
    const now = new Date();
    const onTimeProjects = projects.filter(p => {
      if (!p.endDate) return true;
      const endDate = new Date(p.endDate);
      return endDate >= now || p.status === 'Completed';
    }).length;
    const delayedProjects = projects.length - onTimeProjects;

    setStats({
      totalProjects: projects.length,
      activeProjects,
      totalBudget,
      totalSpent,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      avgProgress: Math.round(avgProgress),
      pendingEstimates,
      approvedEstimates,
      totalMaterials: materials.length,
      totalDocuments: documents.length,
      totalPlans: plans.length,
      onTimeProjects,
      delayedProjects,
    });
  };

  // Export helpers
  const getCombinedRows = () => {
    const filtered = getFilteredData();
    return [
      ...filtered.projects.map((p: any) => ({
        type: 'Project',
        id: p.id,
        code: p.code,
        name: p.name,
        city: p.city,
        state: p.state,
        status: p.status,
        budget: p.budget,
        spent: p.spent,
        progress: p.progress,
        startDate: p.startDate,
        endDate: p.endDate,
        manager: p.managerName,
      })),
      ...filtered.estimates.map((e: any) => ({
        type: 'Estimate',
        id: e.id,
        projectId: e.projectId,
        projectName: e.projectName,
        version: e.version,
        status: e.status,
        subtotal: e.subtotal,
        tax: e.tax,
        total: e.total,
      })),
      ...filtered.documents.map((d: any) => ({
        type: 'Document',
        id: d.id,
        projectId: d.projectId,
        projectName: d.projectName,
        name: d.name,
        docType: d.type,
        version: d.version,
      })),
      ...filtered.plans.map((p: any) => ({
        type: 'Plan',
        id: p.id,
        projectId: p.projectId,
        projectName: p.projectName,
        name: p.name,
        startDate: p.startDate,
        endDate: p.endDate,
        progress: p.progress,
        status: p.status,
        assignedTo: p.assignedToName,
      })),
      ...filtered.boq.map((b: any) => ({
        type: 'BOQ',
        id: b.id,
        projectId: b.projectId,
        projectName: b.projectName,
        version: b.version,
        status: b.status,
        totalCost: b.totalCost,
        itemsCount: b.items?.length || 0,
      })),
    ];
  };

  const getUniqueCities = () => {
    const cities = new Set(projectsData.map((p: any) => p.location || p.city).filter(Boolean));
    return Array.from(cities).sort();
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
        <h1 className="text-3xl font-bold">Engineering Dashboard</h1>
        <p className="text-muted-foreground mt-1">Comprehensive project management and analytics</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filters</CardTitle>
          </div>
          <CardDescription>Filter engineering data by date range, status, and location</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <Label>Date From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>Date To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Project Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="OnHold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* City Filter */}
            <div className="space-y-2">
              <Label>City</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {getUniqueCities().map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end md:col-span-2 lg:col-span-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDateFrom(undefined);
                  setDateTo(undefined);
                  setStatusFilter('all');
                  setCityFilter('all');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primary KPI Cards */}
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
          description={`${stats.budgetUtilization.toFixed(1)}% utilized`}
          icon={DollarSign}
        />
        <KPICard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent, 'short')}
          description="Across all projects"
          icon={TrendingUp}
        />
        <KPICard
          title="Avg Progress"
          value={`${stats.avgProgress}%`}
          description="All projects"
          icon={TrendingUp}
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Pending Estimates"
          value={stats.pendingEstimates}
          description={`${stats.approvedEstimates} approved`}
          icon={FileText}
        />
        <KPICard
          title="Materials"
          value={stats.totalMaterials}
          description="In master database"
          icon={Package}
        />
        <KPICard
          title="Documents"
          value={stats.totalDocuments}
          description="Uploaded files"
          icon={FolderOpen}
        />
        <KPICard
          title="Plans & Tasks"
          value={stats.totalPlans}
          description="Active tasks"
          icon={Calendar}
        />
      </div>

      {/* Project Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline Health</CardTitle>
            <CardDescription>Projects on track vs delayed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">On Time</span>
                </div>
                <span className="text-2xl font-bold">{stats.onTimeProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm">Delayed</span>
                </div>
                <span className="text-2xl font-bold text-destructive">{stats.delayedProjects}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Financial summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Budget</span>
                <span className="text-lg font-bold">{formatCurrency(stats.totalBudget)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Spent</span>
                <span className="text-lg font-bold">{formatCurrency(stats.totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Remaining</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(stats.totalBudget - stats.totalSpent)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Utilization</span>
                  <span className="text-xl font-bold">{stats.budgetUtilization.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${Math.min(stats.budgetUtilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Latest active and planning projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projectsData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects available</p>
          ) : (
            <div className="space-y-4">
              {projectsData.slice(0, 5).map((project: any) => (
                <div key={project.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{project.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {project.code} • {project.city}, {project.state}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        project.status === 'Active' ? 'bg-green-100 text-green-700' :
                        project.status === 'Planning' ? 'bg-blue-100 text-blue-700' :
                        project.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {project.status}
                      </span>
                      <span>Progress: {project.progress || 0}%</span>
                      <span>Budget: {formatCurrency(project.budget || 0)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/engineering/projects/${project.id}`)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Estimates and BOQ */}
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
                        <span className="text-sm font-medium">{estimate.projectName || estimate.projectId}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Version {estimate.version} • {estimate.status}
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        {formatCurrency(estimate.total || 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent BOQ</CardTitle>
            <CardDescription>Latest bill of quantities</CardDescription>
          </CardHeader>
          <CardContent>
            {boqData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No BOQ items available</p>
            ) : (
              <div className="space-y-3">
                {boqData.slice(0, 5).map((boq: any) => (
                  <div key={boq.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{boq.projectName || boq.projectId}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Version {boq.version} • {boq.status} • {boq.items?.length || 0} items
                      </div>
                      <div className="text-sm font-semibold mt-1">
                        {formatCurrency(boq.totalCost || 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents and Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Latest uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            {documentsData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents available</p>
            ) : (
              <div className="space-y-3">
                {documentsData.slice(0, 5).map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {doc.type} • Version {doc.version}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {doc.projectName || doc.projectId}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Plans & Tasks</CardTitle>
            <CardDescription>Latest project tasks</CardDescription>
          </CardHeader>
          <CardContent>
            {plansData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No plans available</p>
            ) : (
              <div className="space-y-3">
                {plansData.slice(0, 5).map((plan: any) => (
                  <div key={plan.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{plan.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {plan.status} • Progress: {plan.progress || 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assigned: {plan.assignedToName || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Material Master Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Material Master Database</CardTitle>
          <CardDescription>Top materials by category</CardDescription>
        </CardHeader>
        <CardContent>
          {materialsData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials available</p>
          ) : (
            <div className="space-y-3">
              {materialsData.slice(0, 8).map((material: any) => (
                <div key={material.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{material.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {material.category} • {material.code}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(material.rate || 0)}/{material.unit}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
