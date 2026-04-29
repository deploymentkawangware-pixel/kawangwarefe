/**
 * Campaign detail page (Sprint 8 / Epic E6).
 *
 * Staff-only. Shows progress, per-recipient table, and a CSV export
 * of failed recipients so operators can follow up offline.
 */

"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { AdminProtectedRoute } from "@/components/auth/admin-protected-route";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GET_MESSAGE_CAMPAIGN } from "@/lib/graphql/messaging-mutations";
import { ArrowLeft, Download } from "lucide-react";

interface Recipient {
  id: string;
  phoneNumber: string;
  status: string;
  renderedBody: string;
  providerMessageId: string;
  error: string;
  sentAt: string | null;
}

interface CampaignDetail {
  id: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  recipientFilterJson: string;
  template: { id: string; name: string; body: string };
}

interface DetailData {
  messageCampaign: CampaignDetail | null;
  messageCampaignRecipients: Recipient[];
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  sent: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-amber-100 text-amber-700",
  draft: "bg-slate-100 text-slate-700",
  queued: "bg-amber-100 text-amber-700",
  sending: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
};

/**
 * CSV export of failed recipients. Pure — exported for unit tests.
 */
export function buildFailuresCsv(recipients: Recipient[]): string {
  const header = "phone_number,error,rendered_body";
  const rows = recipients
    .filter((r) => r.status === "failed")
    .map((r) => {
      const esc = (s: string) => `"${(s || "").replace(/"/g, '""')}"`;
      return [esc(r.phoneNumber), esc(r.error), esc(r.renderedBody)].join(",");
    });
  return [header, ...rows].join("\n");
}

function triggerCsvDownload(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function CampaignDetailContent() {
  const params = useParams<{ id: string }>();
  const campaignId = params?.id ?? "";

  const { data, loading } = useQuery<DetailData>(GET_MESSAGE_CAMPAIGN, {
    variables: { campaignId },
    pollInterval: 4000,
    skip: !campaignId,
  });

  const campaign = data?.messageCampaign;
  const recipients = data?.messageCampaignRecipients ?? [];

  const failuresCsv = useMemo(() => buildFailuresCsv(recipients), [recipients]);

  if (loading && !campaign) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!campaign) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
        <Link href="/admin/messaging">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to messaging
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/messaging"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to messaging
          </Link>
          <h1 className="text-2xl font-bold mt-1">
            Campaign #{campaign.id} — {campaign.template.name}
          </h1>
        </div>
        <Badge className={STATUS_COLOR[campaign.status] || ""}>
          {campaign.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <CardDescription>
            {campaign.sentCount} sent · {campaign.failedCount} failed · {" "}
            {campaign.recipientCount} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted rounded p-2 whitespace-pre-wrap">
            {campaign.template.body}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recipients ({recipients.length})</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={campaign.failedCount === 0}
            onClick={() =>
              triggerCsvDownload(
                `campaign-${campaign.id}-failures.csv`,
                failuresCsv,
              )
            }
          >
            <Download className="h-4 w-4 mr-2" />
            Export failures (CSV)
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {recipients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recipients yet.</p>
          ) : (
            <table className="w-full text-sm" aria-label="Recipients table">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="py-2">Phone</th>
                  <th>Status</th>
                  <th>Provider ID</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {recipients.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="py-2 font-mono text-xs">{r.phoneNumber || "—"}</td>
                    <td>
                      <Badge className={STATUS_COLOR[r.status] || ""}>
                        {r.status}
                      </Badge>
                    </td>
                    <td className="font-mono text-xs">{r.providerMessageId || "—"}</td>
                    <td className="text-xs text-red-700">{r.error || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CampaignDetailPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <CampaignDetailContent />
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
