/**
 * Admin Messaging Page (Sprint 6 / Epic E4.2).
 *
 * Three sections:
 * 1. Templates — list, create.
 * 2. Compose — pick template, set filter, preview, launch.
 * 3. Campaign history — live view of recent campaigns.
 *
 * Server is the source of truth for validation; this page surfaces
 * server messages verbatim rather than duplicating rules client-side.
 */

"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import toast from "react-hot-toast";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GET_MESSAGE_TEMPLATES,
  GET_MESSAGE_CAMPAIGNS,
  CREATE_MESSAGE_TEMPLATE,
  PREVIEW_CAMPAIGN,
  LAUNCH_CAMPAIGN,
} from "@/lib/graphql/messaging-mutations";
import { MessageSquare, Send, Eye, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Campaign {
  id: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  template: { id: string; name: string };
}

interface TemplatesData { messageTemplates: Template[] }
interface CampaignsData { messageCampaigns: Campaign[] }

interface CreateTemplateData {
  createMessageTemplate: { success: boolean; message: string; template: Template | null };
}
interface PreviewData {
  previewCampaign: {
    recipientCount: number;
    skippedCount: number;
    sampleRendered: string[];
  };
}
interface LaunchData {
  launchCampaign: {
    success: boolean;
    message: string;
    campaign: { id: string; status: string; recipientCount: number } | null;
  };
}

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  queued: "bg-amber-100 text-amber-700",
  sending: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function MessagingContent() {
  const { data: tplData, refetch: refetchTemplates } =
    useQuery<TemplatesData>(GET_MESSAGE_TEMPLATES);
  const { data: campData, refetch: refetchCampaigns } =
    useQuery<CampaignsData>(GET_MESSAGE_CAMPAIGNS, { pollInterval: 5000 });

  const [createTemplate, { loading: creating }] = useMutation<CreateTemplateData>(
    CREATE_MESSAGE_TEMPLATE
  );
  const [previewCampaign, { loading: previewing }] = useMutation<PreviewData>(
    PREVIEW_CAMPAIGN
  );
  const [launchCampaign, { loading: launching }] = useMutation<LaunchData>(
    LAUNCH_CAMPAIGN
  );

  const templates = tplData?.messageTemplates ?? [];
  const campaigns = campData?.messageCampaigns ?? [];

  // Template create form state
  const [tplName, setTplName] = useState("");
  const [tplBody, setTplBody] = useState("");

  // Composer state
  const [composerTplId, setComposerTplId] = useState<string>("");
  const [filterJson, setFilterJson] = useState("{}");
  const [preview, setPreview] = useState<PreviewData["previewCampaign"] | null>(null);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await createTemplate({
        variables: { name: tplName.trim(), body: tplBody },
      });
      const res = data?.createMessageTemplate;
      if (res?.success) {
        toast.success(res.message);
        setTplName("");
        setTplBody("");
        await refetchTemplates();
      } else {
        toast.error(res?.message || "Could not create template");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  const handlePreview = async () => {
    if (!composerTplId) {
      toast.error("Pick a template first");
      return;
    }
    try {
      const { data } = await previewCampaign({
        variables: {
          templateId: composerTplId,
          recipientFilterJson: filterJson,
          sampleSize: 3,
        },
      });
      if (data?.previewCampaign) setPreview(data.previewCampaign);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Preview failed");
    }
  };

  const handleLaunch = async () => {
    if (!composerTplId) {
      toast.error("Pick a template first");
      return;
    }
    try {
      const { data } = await launchCampaign({
        variables: {
          templateId: composerTplId,
          recipientFilterJson: filterJson,
        },
      });
      const res = data?.launchCampaign;
      if (res?.success) {
        toast.success(res.message);
        setPreview(null);
        await refetchCampaigns();
      } else {
        toast.error(res?.message || "Launch failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Launch failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Bulk Messaging</h1>
      </div>

      {/* 1. Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Template
          </CardTitle>
          <CardDescription>
            Body supports <code>{"{{first_name}}"}</code>, <code>{"{{last_name}}"}</code>,{" "}
            <code>{"{{full_name}}"}</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTemplate} className="space-y-3">
            <div>
              <Label htmlFor="tpl-name">Name</Label>
              <Input
                id="tpl-name"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="tpl-body">Body</Label>
              <Textarea
                id="tpl-body"
                rows={4}
                value={tplBody}
                onChange={(e) => setTplBody(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create template"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 2. Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Launch Campaign
          </CardTitle>
          <CardDescription>
            Recipient filter is JSON: keys <code>group_ids</code>, <code>department_ids</code>,{" "}
            <code>roles</code>, <code>include_guests</code>, <code>include_minors</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="composer-tpl">Template</Label>
            <Select value={composerTplId} onValueChange={setComposerTplId}>
              <SelectTrigger id="composer-tpl" aria-label="Select template">
                <SelectValue placeholder="Pick a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="composer-filter">Recipient filter (JSON)</Label>
            <Textarea
              id="composer-filter"
              rows={3}
              value={filterJson}
              onChange={(e) => setFilterJson(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={previewing}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewing ? "Previewing…" : "Preview"}
            </Button>
            <Button type="button" onClick={handleLaunch} disabled={launching}>
              <Send className="h-4 w-4 mr-2" />
              {launching ? "Launching…" : "Launch"}
            </Button>
          </div>
          {preview && (
            <Alert>
              <AlertDescription>
                <p className="font-medium">
                  {preview.recipientCount} recipient(s) — {preview.skippedCount} without phone.
                </p>
                {preview.sampleRendered.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {preview.sampleRendered.map((s, i) => (
                      <li key={i} className="font-mono text-xs bg-muted p-2 rounded">
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 3. Campaign history */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {campaigns.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/messaging/${c.id}`}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-muted/50 rounded px-1"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.template.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.sentCount}/{c.recipientCount} sent · {c.failedCount} failed
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={STATUS_COLOR[c.status] || ""}>{c.status}</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Templates list */}
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No templates yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {templates.map((t) => (
                <li key={t.id} className="py-3">
                  <p className="font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {t.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MessagingPage() {
  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <MessagingContent />
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
