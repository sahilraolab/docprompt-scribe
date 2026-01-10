/**
 * Stock Ledger Page
 * Aligned with backend: GET /inventory/ledger
 * 
 * Immutable audit trail of all inventory movements
 */

import { useState } from 'react';
import { useStockLedger } from '@/lib/hooks/useInventory';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/EmptyState';
import { SearchableSelect } from '@/components/SearchableSelect';
import { formatDate } from '@/lib/utils/format';
import { Search, FileText, Loader2, Download, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportToCSV } from '@/lib/utils/export';

export default function StockLedger() {
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [refTypeFilter, setRefTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: projects = [] } = useProjects();
  const { data: ledger = [], isLoading } = useStockLedger(
    selectedProjectId 
      ? { 
          projectId: selectedProjectId,
          ...(refTypeFilter !== 'all' ? { refType: refTypeFilter } : {})
        } 
      : undefined,
    { enabled: !!selectedProjectId }
  );

  const filteredLedger = ledger.filter((entry: any) => {
    const matchesSearch =
      entry.materialName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.remarks?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleExport = () => {
    const data = filteredLedger.map((entry: any) => ({
      Date: formatDate(entry.createdAt),
      Material: entry.materialName,
      Location: entry.locationId,
      'Ref Type': entry.refType,
      'Ref ID': entry.refId,
      'Qty In': entry.qtyIn,
      'Qty Out': entry.qtyOut,
      Balance: entry.balance,
      Remarks: entry.remarks,
    }));
    exportToCSV(data, `stock-ledger-${new Date().toISOString().split('T')[0]}`);
  };

  const getRefTypeBadge = (refType: string) => {
    const styles: Record<string, string> = {
      GRN: 'bg-green-100 text-green-700',
      ISSUE: 'bg-amber-100 text-amber-700',
      ISSUE_CANCEL: 'bg-blue-100 text-blue-700',
      TRANSFER: 'bg-purple-100 text-purple-700',
    };
    return (
      <Badge className={styles[refType] || 'bg-gray-100 text-gray-700'}>
        {refType}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Ledger</h1>
          <p className="text-muted-foreground">Immutable audit trail of all inventory movements</p>
        </div>
        <Button onClick={handleExport} variant="outline" disabled={!selectedProjectId}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchableSelect
                options={projects.map((p: any) => ({
                  value: p.id || p._id,
                  label: `${p.name} (${p.code || 'N/A'})`,
                }))}
                value={selectedProjectId?.toString() || ''}
                onChange={(val) => setSelectedProjectId(val ? Number(val) : null)}
                placeholder="Select project to view ledger..."
              />
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by material..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={!selectedProjectId}
              />
            </div>
            <Select value={refTypeFilter} onValueChange={setRefTypeFilter} disabled={!selectedProjectId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="GRN">GRN (Receipt)</SelectItem>
                <SelectItem value="ISSUE">Issue (Out)</SelectItem>
                <SelectItem value="ISSUE_CANCEL">Issue Cancel</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedProjectId ? (
            <EmptyState
              icon={FileText}
              title="Select a Project"
              description="Choose a project to view its stock ledger"
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLedger.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Ref Type</TableHead>
                    <TableHead>Ref ID</TableHead>
                    <TableHead className="text-right">In</TableHead>
                    <TableHead className="text-right">Out</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLedger.map((entry: any, index: number) => (
                    <TableRow key={entry.id || index}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">{entry.materialName}</TableCell>
                      <TableCell>{entry.locationId}</TableCell>
                      <TableCell>{getRefTypeBadge(entry.refType)}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.refId}</TableCell>
                      <TableCell className="text-right">
                        {entry.qtyIn > 0 && (
                          <span className="text-green-600 flex items-center justify-end gap-1">
                            <ArrowUp className="h-3 w-3" />
                            {entry.qtyIn}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.qtyOut > 0 && (
                          <span className="text-red-600 flex items-center justify-end gap-1">
                            <ArrowDown className="h-3 w-3" />
                            {entry.qtyOut}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">{entry.balance}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {entry.remarks || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No ledger entries found"
              description={
                searchQuery || refTypeFilter !== 'all'
                  ? 'No entries match your filters'
                  : 'Ledger entries will appear here as stock movements occur'
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
