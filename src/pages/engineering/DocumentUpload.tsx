import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateDocument } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const createDocument = useCreateDocument();

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1.0');
  const [revision, setRevision] = useState('A');
  const [drawingNumber, setDrawingNumber] = useState('');
  const [status, setStatus] = useState('Draft');
  const [description, setDescription] = useState('');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  // Remove file from preview list
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!projectId || !documentType || !name || files.length === 0) {
      toast.error('Please fill all required fields and select at least one file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('name', name);
      formData.append('type', documentType);
      formData.append('category', category);
      formData.append('version', version);
      formData.append('revision', revision);
      formData.append('status', status);
      if (drawingNumber) formData.append('drawingNumber', drawingNumber);
      if (description) formData.append('description', description);

      // Backend expects single file upload (`upload.single('file')`)
      formData.append('file', files[0]);

      await createDocument.mutateAsync(formData);
      toast.success('Document uploaded successfully');
      navigate('/engineering/documents');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Build project options
  const projectOptions =
    Array.isArray(projectsData)
      ? projectsData.map((p: any) => ({
          value: p._id || p.id,
          label: `${p.code ? `${p.code} - ` : ''}${p.name}`,
        }))
      : Array.isArray(projectsData?.data)
      ? projectsData.data.map((p: any) => ({
          value: p._id || p.id,
          label: `${p.code ? `${p.code} - ` : ''}${p.name}`,
        }))
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload Document</h1>
          <p className="text-muted-foreground">
            Upload project drawings, reports, and other files
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/engineering/documents')}>
          Cancel
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Row 1 - Project & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Project *</Label>
                {projectsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading projects...</div>
                ) : (
                  <SearchableSelect
                    options={projectOptions}
                    value={projectId}
                    onChange={setProjectId}
                    placeholder="Select project"
                    searchPlaceholder="Search projects..."
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Document Type *</Label>
                <Select required value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drawing">Drawing</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Specification">Specification</SelectItem>
                    <SelectItem value="Certificate">Certificate</SelectItem>
                    <SelectItem value="RERA">RERA</SelectItem>
                    <SelectItem value="Permit">Permit</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2 - Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Name *</Label>
                <Input
                  placeholder="Enter document name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  placeholder="e.g., Structural, Architectural"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3 - Version, Revision, Drawing Number */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Version</Label>
                <Input
                  placeholder="e.g., 1.0"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Revision</Label>
                <Input
                  placeholder="e.g., A"
                  value={revision}
                  onChange={(e) => setRevision(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Drawing Number</Label>
                <Input
                  placeholder="e.g., DWG-001"
                  value={drawingNumber}
                  onChange={(e) => setDrawingNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Row 4 - Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="UnderReview">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Superseded">Superseded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Enter document description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
              <Label>Upload File *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Click below to browse and upload file (max 20 MB)
                </p>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  className="max-w-xs mx-auto cursor-pointer"
                />
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{files.length} file selected:</p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-muted p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024).toFixed(2)} KB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={uploading || files.length === 0}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  'Upload Document'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/engineering/documents')}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
