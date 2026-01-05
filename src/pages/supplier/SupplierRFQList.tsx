import { useNavigate } from "react-router-dom";
import { useSupplierRFQs } from "@/lib/hooks/useSupplier";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Loader2, Send, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export default function SupplierRFQList() {
  const navigate = useNavigate();
  const { data = [], isLoading } = useSupplierRFQs();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Open RFQs</h1>
        <p className="text-muted-foreground">
          Requests for quotation awaiting your response
        </p>
      </div>

      <Card>
        <CardContent>
          {data.length ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ No</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Closing Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {data.map((rfq: any) => (
                    <TableRow key={rfq.id}>
                      <TableCell className="font-medium">
                        {rfq.rfqNo}
                      </TableCell>
                      <TableCell>
                        {formatDate(rfq.rfqDate)}
                      </TableCell>
                      <TableCell>
                        {rfq.closingDate
                          ? formatDate(rfq.closingDate)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={rfq.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(`/supplier/rfqs/${rfq.id}/quote`)
                          }
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Quotation
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No RFQs Available"
              description="You currently have no open RFQs assigned"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
