import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/PageHeader';
import { ArrowLeft, FileText, User, Building2, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils/format';

export default function DistributionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data - replace with actual API call
  const distribution = {
    id: id || '1',
    projectName: 'Green Valley Residency',
    partnerName: 'Rajesh Kumar',
    periodFrom: '2024-01-01',
    periodTo: '2024-03-31',
    amount: 1200000,
    reference: 'Q1 profit distribution',
    distributionDate: '2024-04-10',
    journalRef: 'JV-2024-0045',
    note: 'Distributed as per shareholding agreement - 25% of Q1 profit',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distribution Details"
        description={`Distribution ID: DIST-${distribution.id.padStart(5, '0')}`}
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/partners/distributions'),
            icon: ArrowLeft,
            variant: 'outline',
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribution Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{distribution.projectName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500/10">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Partner</p>
                <p className="font-medium">{distribution.partnerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/10">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-mono font-semibold text-lg text-green-600">
                  {formatCurrency(distribution.amount)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Distribution Date</p>
                <p className="font-medium">{formatDate(distribution.distributionDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Period & References</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Period</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{formatDate(distribution.periodFrom)}</Badge>
                <span className="text-muted-foreground">to</span>
                <Badge variant="outline">{formatDate(distribution.periodTo)}</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Reference</p>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{distribution.reference}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Journal Entry</p>
              <Badge className="font-mono">{distribution.journalRef}</Badge>
            </div>

            {distribution.note && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p className="text-sm p-3 bg-muted/50 rounded-md">{distribution.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
