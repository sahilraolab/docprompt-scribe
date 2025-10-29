import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useMRs,
  useQuotationsByMR,
  useCreateComparativeStatement,
  useComparativeStatement,
} from "@/lib/hooks/usePurchaseBackend";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const csSchema = z.object({
  mrId: z.string().min(1, "Material requisition is required"),
  analysis: z.string().min(1, "Analysis is required"),
});

type CSFormData = z.infer<typeof csSchema>;

export default function ComparativeStatementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CSFormData>({
    resolver: zodResolver(csSchema),
  });

  const mrId = watch("mrId");

  // Load data
  const { data: mrs } = useMRs();
  const { data: quotations = [], isLoading } = useQuotationsByMR(mrId || "");
  const createCS = useCreateComparativeStatement();
  const { data: existingCS, isLoading: isCSLoading } = useComparativeStatement(id || "");

  // ✅ Prefill data when editing
  useEffect(() => {
    if (existingCS && id) {
      reset({
        mrId: existingCS.mrId?._id || existingCS.mrId,
        analysis: existingCS.analysis || existingCS.remarks || "",
      });
      setValue("mrId", existingCS.mrId?._id || existingCS.mrId || "");
      setSelectedSupplier(existingCS.selectedSupplier || null);
    }
  }, [existingCS, id, reset, setValue]);

  // ✅ Reapply supplier selection once quotations load (for edit mode)
  useEffect(() => {
    if (id && existingCS && quotations?.length > 0 && existingCS.selectedSupplier?._id) {
      const matched = quotations.find(
        (q: any) =>
          q.supplierId === existingCS.selectedSupplier._id ||
          q.supplier?._id === existingCS.selectedSupplier._id
      );
      if (matched) {
        setSelectedSupplier(existingCS.selectedSupplier);
      }
    }
  }, [quotations, existingCS, id]);


  const getTotals = (quote: any) => {
    const subtotal =
      Number(quote.subtotal) ||
      quote.items?.reduce(
        (acc: number, item: any) =>
          acc + Number(item.qty || 0) * Number(item.rate || 0),
        0
      ) ||
      0;

    const tax = Number(quote.taxAmount) || Number(quote.tax) || 0;
    const total =
      Number(quote.totalAmount) || Number(quote.total) || subtotal + tax;

    return { subtotal, tax, total };
  };

  const safeQuotations = Array.isArray(quotations) ? quotations : [];

  const onSubmit = (data: CSFormData) => {
    if (!selectedSupplier) {
      toast({
        title: "Error",
        description: "Please select a supplier before submitting.",
        variant: "destructive",
      });
      return;
    }

    const selectedMR = (mrs || []).find(
      (mr: any) => mr._id === data.mrId || mr.id === data.mrId
    );

    if (!selectedMR) {
      toast({
        title: "Error",
        description: "Could not find the selected MR details.",
        variant: "destructive",
      });
      return;
    }

    const firstQuote = safeQuotations[0];
    const items =
      firstQuote?.items?.map((item: any) => ({
        itemId: item.itemId || item._id || item.id,
        description: item.description,
        qty: item.qty,
        uom: item.uom,
      })) || [];

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "No items found to compare.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      mrId: data.mrId,
      projectId: selectedMR.projectId || selectedMR.project?._id || null,
      analysis: data.analysis,
      selectedSupplierId: selectedSupplier._id || selectedSupplier.id,
      items,
    };

    if (!payload.projectId) {
      toast({
        title: "Error",
        description: "Project ID missing in selected MR.",
        variant: "destructive",
      });
      return;
    }

    createCS.mutate(payload, {
      onSuccess: () => {
        toast({
          title: id ? "Comparative Statement Updated" : "Comparative Statement Created",
          description: "Saved successfully.",
        });
        navigate("/purchase/comparative");
      },
      onError: (err: any) => {
        toast({
          title: "Failed to save",
          description: err?.message || "Try again",
          variant: "destructive",
        });
      },
    });
  };

  const handleSupplierClick = (supplier: any) => {
    if (!supplier) return;
    const currentId = selectedSupplier?._id?.toString();
    const newId =
      supplier?._id?.toString() ||
      supplier?.supplierId?.toString() ||
      supplier?.id?.toString();
    if (currentId === newId) setSelectedSupplier(null);
    else setSelectedSupplier(supplier);
  };

  if ((id && isCSLoading) || (id && mrId && isLoading)) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/purchase/comparative")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {id ? "Edit" : "New"} Comparative Statement
          </h1>
          <p className="text-muted-foreground">
            Compare quotations and select supplier
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* MR Select */}
        <Card>
          <CardHeader>
            <CardTitle>Material Requisition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select MR *</Label>
              <Select
                value={mrId}
                onValueChange={(value) => {
                  setValue("mrId", value);
                  setSelectedSupplier(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material requisition" />
                </SelectTrigger>
                <SelectContent>
                  {(mrs || []).map((mr: any) => (
                    <SelectItem key={mr._id || mr.id} value={mr._id || mr.id}>
                      {mr.code || mr.mrCode || mr._id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mrId && (
                <p className="text-sm text-destructive">{errors.mrId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quotation Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {!mrId ? (
              <p className="text-muted-foreground">
                Please select a Material Requisition to view quotations.
              </p>
            ) : isLoading ? (
              <p>Loading quotations...</p>
            ) : safeQuotations.length === 0 ? (
              <p className="text-muted-foreground">
                No quotations available for the selected MR.
              </p>
            ) : (
              <>
                {/* Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        {safeQuotations.map((q) => (
                          <TableHead key={q._id}>{q.supplierName}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {safeQuotations[0]?.items?.map(
                        (item: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">
                              {item.qty} {item.uom}
                            </TableCell>
                            {safeQuotations.map((quote) => (
                              <TableCell key={quote._id} className="text-right">
                                {formatCurrency(
                                  quote.items?.[index]?.rate || 0,
                                  "full"
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      )}

                      {/* Totals */}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell colSpan={2}>Subtotal</TableCell>
                        {safeQuotations.map((quote) => {
                          const { subtotal } = getTotals(quote);
                          return (
                            <TableCell key={quote._id} className="text-right">
                              {formatCurrency(subtotal)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2}>Tax</TableCell>
                        {safeQuotations.map((quote) => {
                          const { tax } = getTotals(quote);
                          return (
                            <TableCell key={quote._id} className="text-right">
                              {formatCurrency(tax)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      <TableRow className="font-bold">
                        <TableCell colSpan={2}>Total</TableCell>
                        {safeQuotations.map((quote) => {
                          const { total } = getTotals(quote);
                          return (
                            <TableCell key={quote._id} className="text-right">
                              {formatCurrency(total)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Supplier Selection Cards */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  {safeQuotations.map((quote) => {
                    const { total } = getTotals(quote);
                    const supplierObj = {
                      _id:
                        quote.supplier?._id ||
                        quote.supplierId ||
                        quote.supplier_id ||
                        quote._id,
                      name:
                        quote.supplierName ||
                        quote.supplier?.name ||
                        "Unknown Supplier",
                    };
                    const isSelected =
                      selectedSupplier?._id?.toString() ===
                      supplierObj._id?.toString();

                    return (
                      <Card
                        key={quote._id}
                        onClick={() => handleSupplierClick(supplierObj)}
                        className={`cursor-pointer transition-all ${isSelected
                            ? "border-primary border-2 bg-primary/5"
                            : "hover:border-primary/40"
                          }`}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">
                              {quote.supplierName}
                            </CardTitle>
                            {isSelected && (
                              <Badge variant="default">
                                <Check className="h-3 w-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span className="font-semibold">
                              {formatCurrency(total)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery:</span>
                            <span>{quote.deliveryDays || "N/A"} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment:</span>
                            <span>{quote.paymentTerms || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valid Until:</span>
                            <span>
                              {quote.validUntil
                                ? new Date(
                                  quote.validUntil
                                ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis & Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="analysis">Analysis *</Label>
              <Textarea
                {...register("analysis")}
                placeholder="Provide analysis comparing quotations, considering price, delivery time, payment terms, and supplier reliability."
                rows={5}
              />
              {errors.analysis && (
                <p className="text-sm text-destructive">
                  {errors.analysis.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/purchase/comparative")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!selectedSupplier || createCS.isPending}
          >
            {id ? "Update" : "Create"} Statement
          </Button>
        </div>
      </form>
    </div>
  );
}
