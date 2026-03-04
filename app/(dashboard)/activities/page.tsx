"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Filter, CheckCircle } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  title: string;
  body: string | null;
  dueAt: string | null;
  completedAt: string | null;
  createdAt: string;
  isAutomated: boolean;
  createdBy: { user: { name: string | null } };
  assignee: { user: { name: string | null } } | null;
  opportunity: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  account: { id: string; name: string } | null;
}

const activityIcons: Record<string, string> = {
  NOTE: "📝", CALL: "📞", EMAIL: "✉️", MEETING: "🤝", TASK: "✅",
  DEMO: "🖥️", PROPOSAL_SENT: "📄", CONTRACT_SENT: "📋",
  STAGE_CHANGE: "↕️", SYSTEM: "⚙️",
};

const activityTypes = [
  "NOTE", "CALL", "EMAIL", "MEETING", "TASK", "DEMO", "PROPOSAL_SENT", "CONTRACT_SENT",
] as const;

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [showOverdue, setShowOverdue] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ type: "NOTE", title: "", body: "", dueAt: "" });

  const loadData = useCallback(async () => {
    const params = new URLSearchParams();
    if (filter) params.set("type", filter);
    if (showOverdue) params.set("overdue", "true");
    const res = await fetch(`/api/workspace/activities?${params}`);
    const data = await res.json();
    setActivities(data.activities ?? []);
    setLoading(false);
  }, [filter, showOverdue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!form.title) return;
    await fetch("/api/workspace/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: form.type,
        title: form.title,
        body: form.body || null,
        dueAt: form.dueAt || null,
      }),
    });
    setShowCreate(false);
    setForm({ type: "NOTE", title: "", body: "", dueAt: "" });
    loadData();
  };

  const handleComplete = async (id: string) => {
    await fetch(`/api/workspace/activities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt: new Date().toISOString() }),
    });
    loadData();
  };

  const isOverdue = (act: Activity) =>
    act.type === "TASK" && act.dueAt && !act.completedAt && new Date(act.dueAt) < new Date();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Activities</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Log Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button
          variant={!filter && !showOverdue ? "default" : "outline"}
          size="sm"
          onClick={() => { setFilter(null); setShowOverdue(false); }}
        >
          All
        </Button>
        {activityTypes.map((t) => (
          <Button
            key={t}
            variant={filter === t ? "default" : "outline"}
            size="sm"
            onClick={() => { setFilter(t); setShowOverdue(false); }}
          >
            {activityIcons[t]} {t}
          </Button>
        ))}
        <Button
          variant={showOverdue ? "destructive" : "outline"}
          size="sm"
          onClick={() => { setShowOverdue(!showOverdue); setFilter(null); }}
        >
          Overdue Tasks
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          No activities found.{" "}
          <button onClick={() => setShowCreate(true)} className="text-orange-600 hover:underline">
            Log one
          </button>
        </p>
      ) : (
        <div className="space-y-2">
          {activities.map((act) => (
            <Card key={act.id} className={isOverdue(act) ? "border-red-200 bg-red-50/50" : ""}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{activityIcons[act.type] ?? "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{act.title}</p>
                      {isOverdue(act) && <Badge variant="destructive" className="text-xs">Overdue</Badge>}
                      {act.completedAt && <Badge variant="secondary" className="text-xs">Done</Badge>}
                    </div>
                    {act.body && (
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap line-clamp-2">
                        {act.body}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span>{act.createdBy.user.name ?? "System"}</span>
                      <span>{new Date(act.createdAt).toLocaleString()}</span>
                      {act.opportunity && <span>Deal: {act.opportunity.name}</span>}
                      {act.contact && <span>Contact: {act.contact.firstName} {act.contact.lastName}</span>}
                      {act.dueAt && <span>Due: {new Date(act.dueAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  {act.type === "TASK" && !act.completedAt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleComplete(act.id)}
                      title="Mark complete"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2 flex-wrap">
              {activityTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  className={`px-3 py-1.5 text-xs rounded-md border ${form.type === t ? "bg-orange-50 border-orange-200 text-orange-700" : "hover:bg-gray-50"}`}
                >
                  {activityIcons[t]} {t}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What happened?" />
            </div>
            <div>
              <label className="text-sm font-medium">Details</label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Details (Markdown supported)" rows={3} />
            </div>
            {form.type === "TASK" && (
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input type="datetime-local" value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Log</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
