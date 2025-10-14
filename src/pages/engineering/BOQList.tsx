import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { SearchBar } from '@/components/SearchBar';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useBOQs, useDeleteBOQ } from '@/lib/hooks/useMaterialMaster';
import { BOQ } from '@/types/engineering';
import { exportToCSV } from '@/lib/utils/export';

const BOQList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: boqs, isLoading } = useBOQs();
  const deleteBOQ = useDeleteBOQ();

  const filteredBOQs = (Array.isArray(boqs) ? boqs : []).filter((boq: BOQ) =>
    boq.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    boq.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    exportToCSV(filteredBOQs, 'boq-list.csv');
  };

  const columns = [
    { key: 'id', header: 'BOQ ID', label: 'BOQ ID' },
    { key: 'projectName', header: 'Project', label: 'Project' },
    { key: 'version', header: 'Version', label: 'Version' },
    {
      key: 'totalCost',
      header: 'Total Cost',
      label: 'Total Cost',
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      label: 'Status',
      render: (value: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
          Draft: 'secondary',
          Approved: 'default',
          Active: 'default',
          Completed: 'outline',
        };
        return <Badge variant={variants[value] || 'secondary'}>{value}</Badge>;
      },
    },
    {
      key: 'items',
      header: 'Items',
      label: 'Items',
      render: (items: any[]) => items?.length || 0,
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bill of Quantities (BOQ)"
        description="Material requirements and cost estimates for projects"
      />

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search BOQ..."
            className="flex-1 max-w-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => navigate('/engineering/boq/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create BOQ
            </Button>
          </div>
        </div>
      </Card>

      {filteredBOQs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No BOQ found"
          description="Create BOQ from approved estimates to start procurement"
          action={{
            label: 'Create BOQ',
            onClick: () => navigate('/engineering/boq/new'),
          }}
        />
      ) : (
        <DataTable
          data={filteredBOQs}
          columns={columns}
          onRowClick={(boq) => navigate(`/engineering/boq/${boq.id}`)}
        />
      )}
    </div>
  );
};

export default BOQList;
