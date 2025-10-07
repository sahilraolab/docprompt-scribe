import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function LabourRatesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      toast({
        title: id ? 'Labour rate updated' : 'Labour rate created',
        description: 'Labour rate saved successfully',
      });
      setSaving(false);
      navigate('/contracts/labour-rates');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Edit' : 'New'} Labour Rate</h1>
          <p className="text-muted-foreground">Define labour category rates</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/contracts/labour-rates')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Rate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Labour Category *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skilled">Skilled Labour</SelectItem>
                    <SelectItem value="semiskilled">Semi-Skilled Labour</SelectItem>
                    <SelectItem value="unskilled">Unskilled Labour</SelectItem>
                    <SelectItem value="mason">Mason</SelectItem>
                    <SelectItem value="carpenter">Carpenter</SelectItem>
                    <SelectItem value="welder">Welder</SelectItem>
                    <SelectItem value="electrician">Electrician</SelectItem>
                    <SelectItem value="plumber">Plumber</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="delhi">Delhi</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                    <SelectItem value="pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dailyRate">Daily Rate (₹) *</Label>
                <Input type="number" id="dailyRate" placeholder="Enter daily rate" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                <Input type="number" id="hourlyRate" placeholder="Enter hourly rate" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtimeRate">Overtime Rate (₹)</Label>
                <Input type="number" id="overtimeRate" placeholder="Enter overtime rate" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveFrom">Effective From *</Label>
                <Input type="date" id="effectiveFrom" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveTo">Effective To</Label>
                <Input type="date" id="effectiveTo" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : id ? 'Update Rate' : 'Create Rate'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/contracts/labour-rates')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
