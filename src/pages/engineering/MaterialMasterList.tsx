import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useMaterialMaster, useDeleteMaterial } from '@/lib/hooks/useMaterialMaster';
import { MaterialMaster } from '@/types/engineering';
import { exportToCSV } from '@/lib/utils/export';

const MaterialMasterList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const { data: materials, isLoading } = useMaterialMaster();
  const deleteMaterial = useDeleteMaterial();

  const categories = ['Cement', 'Steel', 'Sand', 'Aggregates', 'Bricks', 'Paint', 'Electrical', 'Plumbing', 'Hardware', 'Other'];

  const filteredMaterials = (Array.isArray(materials) ? materials : []).filter((material: MaterialMaster) => {
    const matchesSearch = material.name.toLowerCase().includes(search.toLowerCase()) ||
      material.code.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    exportToCSV(filteredMaterials, 'material-master.csv');
  };

  const columns = [
    { key: 'code', header: 'Code', label: 'Code' },
    { key: 'name', header: 'Name', label: 'Name' },
    { key: 'category', header: 'Category', label: 'Category' },
    { key: 'uom', header: 'UOM', label: 'UOM' },
    {
      key: 'standardRate',
      header: 'Std Rate',
      label: 'Std Rate',
      render: (value: number) => value ? `₹${value.toLocaleString()}` : '-',
    },
    {
      key: 'lastPurchaseRate',
      header: 'Last Rate',
      label: 'Last Rate',
      render: (value: number) => value ? `₹${value.toLocaleString()}` : '-',
    },
    {
      key: 'active',
      header: 'Status',
      label: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Material Master"
        description="Centralized material database for procurement and BOQ"
      />

      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => navigate('/engineering/materials/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Material
            </Button>
          </div>
        </div>
      </Card>

      {filteredMaterials.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No materials found"
          description="Get started by adding your first material to the master database."
          action={{
            label: 'Add Material',
            onClick: () => navigate('/engineering/materials/new'),
          }}
        />
      ) : (
        <DataTable
          data={filteredMaterials}
          columns={columns}
          onRowClick={(material) => navigate(`/engineering/materials/${material.id}`)}
        />
      )}
    </div>
  );
};

export default MaterialMasterList;
