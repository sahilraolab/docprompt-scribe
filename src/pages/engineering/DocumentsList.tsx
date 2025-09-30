import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EmptyState } from '@/components/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { Plus, Search, FileText, Download, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function DocumentsList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const documents = [
    {
      id: '1',
      name: 'Site Plan - Phase 1',
      type: 'Drawing',
      projectName: 'Green Valley Apartments',
      fileSize: '2.4 MB',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-01-15',
      version: 'v2.0',
    },
    {
      id: '2',
      name: 'Structural Design Report',
      type: 'Report',
      projectName: 'Green Valley Apartments',
      fileSize: '5.1 MB',
      uploadedBy: 'Jane Smith',
      uploadedAt: '2024-01-12',
      version: 'v1.0',
    },
    {
      id: '3',
      name: 'BOQ Final',
      type: 'BOQ',
      projectName: 'City Mall Extension',
      fileSize: '1.8 MB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-10',
      version: 'v3.0',
    },
    {
      id: '4',
      name: 'Site Photos - Week 12',
      type: 'Photo',
      projectName: 'Smart Office Tower',
      fileSize: '12.5 MB',
      uploadedBy: 'Sarah Lee',
      uploadedAt: '2024-01-08',
      version: 'v1.0',
    },
  ];

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Drawing':
        return 'bg-blue-100 text-blue-800';
      case 'Report':
        return 'bg-green-100 text-green-800';
      case 'BOQ':
        return 'bg-purple-100 text-purple-800';
      case 'Photo':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Documents</h1>
          <p className="text-muted-foreground">Manage drawings, reports, and files</p>
        </div>
        <Button onClick={() => navigate('/engineering/documents/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by document name, project, or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(doc.type)} variant="secondary">
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.projectName}</TableCell>
                      <TableCell>{doc.version}</TableCell>
                      <TableCell>{doc.fileSize}</TableCell>
                      <TableCell>{doc.uploadedBy}</TableCell>
                      <TableCell>{formatDate(doc.uploadedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No documents found"
              description={
                searchQuery
                  ? "No documents match your search criteria"
                  : "Upload project documents, drawings, and reports"
              }
              action={
                !searchQuery
                  ? {
                      label: "Upload Document",
                      onClick: () => navigate('/engineering/documents/new'),
                    }
                  : undefined
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
