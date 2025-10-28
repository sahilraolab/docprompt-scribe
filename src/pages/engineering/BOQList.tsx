import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { SearchBar } from '@/components/SearchBar';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useBOQs, useDeleteBOQ } from '@/lib/hooks/useMaterialMaster';
import { exportToCSV } from '@/lib/utils/export';

const BOQList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  
  const { data: boqs, isLoading } = useBOQs();
  const deleteBOQ = useDeleteBOQ();

  const filteredBOQs = (Array.isArray(boqs) ? boqs : []).filter((boq: any) => {
    const projectName = boq.projectId?.name || boq.projectName || '';
    const code = boq.code || '';
    return (
      projectName.toLowerCase().includes(search.toLowerCase()) ||
      code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExport = () => {
    exportToCSV(filteredBOQs, 'boq-list.csv');
  };

  // ✅ FIXED: all render functions now receive full row (boq), not individual field values
  const columns = [
    {
      key: 'code',
      header: 'BOQ Code',
      render: (boq: any) => boq.code || 'N/A',
    },
    {
      key: 'projectId',
      header: 'Project',
      render: (boq: any) =>
        boq.projectId
          ? `${boq.projectId.code || ''} - ${boq.projectId.name || 'N/A'}`
          : boq.projectName || 'N/A',
    },
    {
      key: 'name',
      header: 'BOQ Name',
      render: (boq: any) => boq.name || 'N/A',
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (boq: any) =>
        boq.totalAmount
          ? `₹${boq.totalAmount.toLocaleString('en-IN')}`
          : '₹0',
    },
    {
      key: 'status',
      header: 'Status',
      render: (boq: any) => {
        const variants: Record<
          string,
          'default' | 'secondary' | 'destructive' | 'outline'
        > = {
          Draft: 'secondary',
          Approved: 'default',
          Revised: 'outline',
          Archived: 'destructive',
        };
        return (
          <Badge variant={variants[boq.status] || 'secondary'}>
            {boq.status || 'Draft'}
          </Badge>
        );
      },
    },
    {
      key: 'items',
      header: 'Items',
      render: (boq: any) =>
        Array.isArray(boq.items) ? boq.items.length : 0,
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
          onRowClick={(boq) =>
            navigate(`/engineering/boq/${boq._id || boq.id}`)
          }
        />
      )}
    </div>
  );
};

export default BOQList;
