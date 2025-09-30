import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, Clock, CheckCircle } from 'lucide-react';

export default function WorkflowIndex() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Workflow & Approvals</h1>
        <p className="text-muted-foreground">Manage approval workflows and SLAs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Workflow Config
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Configure approval chains</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Review pending requests</p>
            <div className="mt-2">
              <span className="text-2xl font-bold text-amber-500">3</span>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              SLA Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Track SLA compliance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Workflow module coming soon. Complete approval management with configurable workflows and SLA tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
