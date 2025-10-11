import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateDocument } from '@/lib/hooks/useEngineering';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function DocumentUpload() {
  const navigate = useNavigate();
  const { data: projectsData } = useProjects();
  const createDocument = useCreateDocument();
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [projectId, setProjectId] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [name, setName] = useState('');
  const [version, setVersion] = useState('1');
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };


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
      formData.append('version', version);
      if (description) formData.append('description', description);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      await createDocument.mutateAsync(formData);
      navigate('/engineering/documents');
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload Documents</h1>
          <p className="text-muted-foreground">Upload project drawings and files</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/engineering/documents')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <SearchableSelect
                  options={(projectsData?.data || []).map((project: any) => ({
                    value: project._id || project.id,
                    label: `${project.code} - ${project.name}`
                  }))}
                  value={projectId}
                  onChange={setProjectId}
                  placeholder="Select project"
                  searchPlaceholder="Search projects..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Document Type *</Label>
                <Select required value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plan">Plan</SelectItem>
                    <SelectItem value="Permit">Permit</SelectItem>
                    <SelectItem value="Report">Report</SelectItem>
                    <SelectItem value="Drawing">Drawing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Document Name *</Label>
                <Input 
                  id="title" 
                  placeholder="Enter document name" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version" 
                  placeholder="e.g., 1" 
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter document description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label>Upload Files *</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="max-w-xs mx-auto"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{files.length} file(s) selected:</p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
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
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={uploading || files.length === 0}>
                {uploading ? 'Uploading...' : 'Upload Documents'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/engineering/documents')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
