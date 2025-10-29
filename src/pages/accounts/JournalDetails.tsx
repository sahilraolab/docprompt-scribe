import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2, Trash2 } from 'lucide-react';
import { useJournal, useDeleteJournal, usePostJournal } from '@/lib/hooks/useAccounts';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function JournalDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: journal, isLoading } = useJournal(id);
  const deleteJournal = useDeleteJournal();
  const postJournal = usePostJournal();

  const handleDelete = async () => {
    if (id) {
      await deleteJournal.mutateAsync(id);
      navigate('/accounts/journals');
    }
  };

  const handlePost = async () => {
    if (id) {
      await postJournal.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/journals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Journal Not Found</h1>
            <p className="text-muted-foreground">The requested journal entry could not be found</p>
          </div>
        </div>
      </div>
    );
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Payment':
        return 'bg-red-100 text-red-800';
      case 'Receipt':
        return 'bg-green-100 text-green-800';
      case 'Journal':
      case 'General':
        return 'bg-blue-100 text-blue-800';
      case 'Contra':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/accounts/journals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Journal Entry</h1>
            <p className="text-muted-foreground">{journal.code}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {journal.status === 'Draft' && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/accounts/journals/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handlePost} disabled={postJournal.isPending}>
                {postJournal.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Journal
              </Button>
            </>
          )}
          {journal.status === 'Draft' && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this journal entry? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Journal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-medium">{journal.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(journal.date)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge className={getTypeBadgeColor(journal.type)} variant="secondary">
                  {journal.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={journal.status} />
              </div>
            </div>
            {journal.projectName && (
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{journal.projectName}</p>
              </div>
            )}
            {journal.narration && (
              <div>
                <p className="text-sm text-muted-foreground">Narration</p>
                <p className="font-medium">{journal.narration}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Debit</p>
                <p className="text-2xl font-bold">{formatCurrency(journal.totalDebit)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Credit</p>
                <p className="text-2xl font-bold">{formatCurrency(journal.totalCredit)}</p>
              </div>
            </div>
            {Math.abs(journal.totalDebit - journal.totalCredit) < 0.01 ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">✓ Journal is balanced</p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">
                  ⚠ Journal is not balanced (Difference: {formatCurrency(Math.abs(journal.totalDebit - journal.totalCredit))})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Narration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journal.entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.accountName || entry.accountId}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.narration || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {journal.createdAt && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">{formatDate(journal.createdAt)}</p>
            </div>
            {journal.createdBy && (
              <div>
                <p className="text-sm text-muted-foreground">Created By</p>
                <p className="font-medium">{journal.createdBy}</p>
              </div>
            )}
            {journal.updatedAt && (
              <div>
                <p className="text-sm text-muted-foreground">Updated At</p>
                <p className="font-medium">{formatDate(journal.updatedAt)}</p>
              </div>
            )}
            {journal.updatedBy && (
              <div>
                <p className="text-sm text-muted-foreground">Updated By</p>
                <p className="font-medium">{journal.updatedBy}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
