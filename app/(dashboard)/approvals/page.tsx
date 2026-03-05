"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Approval {
  id: string;
  status: string;
  requestedAt: string;
  unmetRequirements: Array<{ type: string; label: string; met: boolean }>;
  opportunity: {
    id: string;
    name: string;
    value: string;
    currency: string;
    stage: { name: string };
  };
  targetStage: { id: string; name: string };
  requestedBy: { id: string; user: { name: string | null; email: string } };
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState<Approval | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace/approvals");
      if (res.status === 403) {
        setError("You don't have permission to view approvals.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Failed to load approvals");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setApprovals(data.approvals ?? []);
    } catch {
      setError("Network error — please try again");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReview = async () => {
    if (!reviewDialog || !reviewAction) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/workspace/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: reviewDialog.id,
          action: reviewAction,
          note: reviewNote || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to process approval");
      } else {
        setReviewDialog(null);
        setReviewAction(null);
        setReviewNote("");
        loadData();
      }
    } catch {
      setError("Network error — please try again");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Approvals</h1>
          {approvals.length > 0 && (
            <Badge variant="destructive">{approvals.length} pending</Badge>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {approvals.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-muted-foreground">No pending approvals. All clear!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => (
            <Card key={approval.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                      <Link
                        href={`/pipeline/${approval.opportunity.id}`}
                        className="font-semibold text-orange-600 hover:underline truncate"
                      >
                        {approval.opportunity.name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 flex-wrap">
                      <Badge variant="outline">{approval.opportunity.stage.name}</Badge>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <Badge variant="secondary">{approval.targetStage.name}</Badge>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(
                          Number(approval.opportunity.value),
                          approval.opportunity.currency
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Requested by {approval.requestedBy.user.name ?? approval.requestedBy.user.email}
                        {" "}on {new Date(approval.requestedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Unmet requirements */}
                    <div className="mt-3 space-y-1">
                      {(approval.unmetRequirements as Array<{ type: string; label: string; met: boolean }>).map(
                        (req, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            {req.met ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                            )}
                            <span className={req.met ? "text-muted-foreground" : "text-red-700"}>
                              {req.label}
                            </span>
                            <Badge variant="outline" className="text-xs font-mono">
                              {req.type}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReviewDialog(approval);
                        setReviewAction("REJECT");
                        setReviewNote("");
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-1 text-red-500" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setReviewDialog(approval);
                        setReviewAction("APPROVE");
                        setReviewNote("");
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Confirmation Dialog */}
      <Dialog
        open={!!reviewDialog && !!reviewAction}
        onOpenChange={(open) => {
          if (!open) {
            setReviewDialog(null);
            setReviewAction(null);
            setReviewNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "APPROVE" ? "Approve Stage Move" : "Reject Stage Move"}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "APPROVE"
                ? `This will move "${reviewDialog?.opportunity.name}" to ${reviewDialog?.targetStage.name} despite unmet requirements.`
                : `This will reject the request to move "${reviewDialog?.opportunity.name}" to ${reviewDialog?.targetStage.name}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Note (optional)</label>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={
                reviewAction === "APPROVE"
                  ? "Reason for approving despite missing requirements..."
                  : "Reason for rejecting..."
              }
              rows={3}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialog(null);
                setReviewAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={reviewAction === "APPROVE" ? "default" : "destructive"}
              onClick={handleReview}
              disabled={submitting}
            >
              {submitting
                ? "Processing..."
                : reviewAction === "APPROVE"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
