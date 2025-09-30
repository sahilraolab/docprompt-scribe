import { useState } from 'react';
import { Check, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApproveRequest } from '@/lib/hooks/useApprovals';

interface ApprovalActionsProps {
  requestId: string;
  entityType: string;
  entityCode: string;
  onSuccess?: () => void;
}

export function ApprovalActions({
  requestId,
  entityType,
  entityCode,
  onSuccess,
}: ApprovalActionsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [remarks, setRemarks] = useState('');
  
  const { mutate: processRequest, isPending } = useApproveRequest();

  const handleAction = (actionType: 'approve' | 'reject') => {
    setAction(actionType);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    processRequest(
      { id: requestId, action, remarks },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setRemarks('');
          onSuccess?.();
        },
      }
    );
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => handleAction('approve')}
          disabled={isPending}
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => handleAction('reject')}
          disabled={isPending}
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approve' : 'Reject'} Request
            </DialogTitle>
            <DialogDescription>
              {action === 'approve' ? 'Approving' : 'Rejecting'} {entityType} {entityCode}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">
                Remarks {action === 'reject' ? '*' : '(Optional)'}
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  action === 'approve'
                    ? 'Add any approval notes...'
                    : 'Provide reason for rejection...'
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={handleConfirm}
              disabled={isPending || (action === 'reject' && !remarks.trim())}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
