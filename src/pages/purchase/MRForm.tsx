import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useProjects } from '@/lib/hooks/useProjects';
import { useCreateRequisition } from '@/lib/hooks/usePurchase';
import {
  useApprovedBudgetsForPurchase,
  useFinalEstimatesForPurchase,
} from '@/lib/hooks/useEngineeringPurchase';

import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

/* =====================================================
   TYPES
===================================================== */

interface MRFormData {
  projectId: string;
  budgetId: string;
  estimateId: string;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function MRForm() {
  const navigate = useNavigate();
  const createMR = useCreateRequisition();

  /* ===================== FORM ===================== */

  const { handleSubmit, watch, setValue } = useForm<MRFormData>({
    defaultValues: {
      projectId: '',
      budgetId: '',
      estimateId: '',
    },
  });

  const projectId = watch('projectId');
  const budgetId = watch('budgetId');
  const estimateId = watch('estimateId');

  const numericProjectId = projectId
    ? Number(projectId)
    : undefined;

  /* ===================== DATA ===================== */

  const { data: projects = [] } = useProjects();

  const { data: budgets = [] } =
    useApprovedBudgetsForPurchase(numericProjectId);

  const { data: estimates = [] } =
    useFinalEstimatesForPurchase(numericProjectId);

  /* ===================== OPTIONS ===================== */

  const projectOptions = projects.map((p: any) => ({
    value: String(p.id),
    label: `${p.name} (${p.code})`,
  }));

  const budgetOptions = budgets.map((b: any) => ({
    value: String(b.id),
    label: `₹${Number(b.totalBudget).toLocaleString('en-IN')} (APPROVED)`,
  }));

  const estimateOptions = estimates.map((e: any) => ({
    value: String(e.id),
    label: `${e.name} (FINAL)`,
  }));

  const showNoBudgetAlert =
    !!numericProjectId && budgets.length === 0;

  const showNoEstimateAlert =
    !!numericProjectId && estimates.length === 0;

  /* ===================== SUBMIT ===================== */

  const onSubmit = (data: MRFormData) => {
    if (!data.projectId || !data.budgetId || !data.estimateId) {
      toast.error('Project, Budget and Estimate are required');
      return;
    }

    createMR.mutate(
      {
        projectId: Number(data.projectId),
        budgetId: Number(data.budgetId),
        estimateId: Number(data.estimateId),
      },
      {
        onSuccess: () => {
          toast.success('Material Requisition created');
          navigate('/purchase/mrs');
        },
      }
    );
  };

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/purchase/mrs')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Material Requisition</h1>
          <p className="text-muted-foreground">
            Engineering-approved procurement request
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Project & Engineering Data</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Project */}
            <div>
              <Label>Project *</Label>
              <SearchableSelect
                options={projectOptions}
                value={projectId}
                onChange={(val) => {
                  setValue('projectId', val);
                  setValue('budgetId', '');
                  setValue('estimateId', '');
                }}
                placeholder="Select project"
              />
            </div>

            {/* Budget Alert */}
            {showNoBudgetAlert && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No APPROVED budget found for this project
                </AlertDescription>
              </Alert>
            )}

            {/* Estimate Alert */}
            {showNoEstimateAlert && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No FINAL estimate found for this project
                </AlertDescription>
              </Alert>
            )}

            {/* Budget */}
            <div>
              <Label>Approved Budget *</Label>
              <SearchableSelect
                options={budgetOptions}
                value={budgetId}
                onChange={(val) => setValue('budgetId', val)}
                placeholder="Select approved budget"
                disabled={!numericProjectId || showNoBudgetAlert}
              />
            </div>

            {/* Estimate */}
            <div>
              <Label>Final Estimate *</Label>
              <SearchableSelect
                options={estimateOptions}
                value={estimateId}
                onChange={(val) => setValue('estimateId', val)}
                placeholder="Select final estimate"
                disabled={!numericProjectId || showNoEstimateAlert}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/purchase/mrs')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              !numericProjectId ||
              !budgetId ||
              !estimateId ||
              showNoBudgetAlert ||
              showNoEstimateAlert
            }
          >
            <Send className="h-4 w-4 mr-2" />
            Create MR
          </Button>
        </div>
      </form>
    </div>
  );
}
