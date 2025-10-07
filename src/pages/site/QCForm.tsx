import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function QCForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      toast({
        title: id ? 'QC inspection updated' : 'QC inspection created',
        description: 'QC inspection saved successfully',
      });
      setSaving(false);
      navigate('/site/qc');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} QC Inspection</h1>
          <p className="text-muted-foreground">Quality control inspection form</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/site/qc')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grn">GRN Reference *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select GRN" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grn1">GRN-2024-001</SelectItem>
                    <SelectItem value="grn2">GRN-2024-002</SelectItem>
                    <SelectItem value="grn3">GRN-2024-003</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item">Item *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="item1">Cement (50kg bags)</SelectItem>
                    <SelectItem value="item2">TMT Bars 16mm</SelectItem>
                    <SelectItem value="item3">Aggregates 20mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectionDate">Inspection Date *</Label>
                <Input type="date" id="inspectionDate" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspector">Inspector *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u1">Rajesh Kumar</SelectItem>
                    <SelectItem value="u2">Priya Sharma</SelectItem>
                    <SelectItem value="u3">Amit Patel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityInspected">Quantity Inspected *</Label>
                <Input type="number" id="quantityInspected" placeholder="Enter quantity" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passed">Passed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="conditional">Conditional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testResults">Test Results</Label>
              <Textarea 
                id="testResults" 
                placeholder="Enter test results and measurements"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea 
                id="remarks" 
                placeholder="Enter any remarks or observations"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : id ? 'Update Inspection' : 'Create Inspection'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/site/qc')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
