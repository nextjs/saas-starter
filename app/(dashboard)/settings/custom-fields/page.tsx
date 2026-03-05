"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";

const ENTITY_TYPES = ["CONTACT", "ACCOUNT", "OPPORTUNITY"] as const;
type EntityType = (typeof ENTITY_TYPES)[number];

const FIELD_TYPES = [
  "TEXT", "NUMBER", "DATE", "BOOLEAN", "SELECT", "MULTI_SELECT", "URL",
] as const;

interface CustomField {
  id: string;
  entityType: EntityType;
  name: string;
  key: string;
  fieldType: string;
  options: string[];
  required: boolean;
  position: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export default function CustomFieldsPage() {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EntityType>("CONTACT");
  const [showCreate, setShowCreate] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    key: "",
    fieldType: "TEXT" as string,
    options: "",
    required: false,
  });

  const loadData = useCallback(async () => {
    const res = await fetch("/api/workspace/custom-fields");
    const data = await res.json();
    setFields(data.fields ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredFields = fields
    .filter((f) => f.entityType === activeTab)
    .sort((a, b) => a.position - b.position);

  const handleCreate = async () => {
    if (!form.name) return;
    setError(null);
    try {
      const res = await fetch("/api/workspace/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType: activeTab,
          name: form.name,
          key: form.key || slugify(form.name),
          fieldType: form.fieldType,
          options:
            form.fieldType === "SELECT" || form.fieldType === "MULTI_SELECT"
              ? form.options.split(",").map((o) => o.trim()).filter(Boolean)
              : [],
          required: form.required,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to create field");
        return;
      }
      setShowCreate(false);
      setForm({ name: "", key: "", fieldType: "TEXT", options: "", required: false });
      loadData();
    } catch {
      setError("Network error — please try again");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this custom field? Data stored in this field will be lost.")) return;
    const res = await fetch(`/api/workspace/custom-fields?fieldId=${id}`, { method: "DELETE" });
    if (res.ok) loadData();
  };

  const handleInlineEdit = async (field: CustomField) => {
    if (!editName || editName === field.name) {
      setEditingField(null);
      return;
    }
    const res = await fetch("/api/workspace/custom-fields", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: field.id, name: editName }),
    });
    if (res.ok) loadData();
    setEditingField(null);
  };

  const tabLabel = (et: EntityType) => {
    switch (et) {
      case "CONTACT": return "Contacts";
      case "ACCOUNT": return "Accounts";
      case "OPPORTUNITY": return "Opportunities";
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Custom Fields</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Field
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
        <TabsList>
          {ENTITY_TYPES.map((et) => (
            <TabsTrigger key={et} value={et}>
              {tabLabel(et)}
              <Badge variant="secondary" className="ml-2 text-xs">
                {fields.filter((f) => f.entityType === et).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {ENTITY_TYPES.map((et) => (
          <TabsContent key={et} value={et}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{tabLabel(et)} Fields</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded" />
                    ))}
                  </div>
                ) : filteredFields.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No custom fields for {tabLabel(et).toLowerCase()}. Add one to get started.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          {editingField?.id === field.id ? (
                            <Input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onBlur={() => handleInlineEdit(field)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleInlineEdit(field);
                                if (e.key === "Escape") setEditingField(null);
                              }}
                              className="h-8 w-48"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{field.name}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setEditingField(field);
                                  setEditName(field.name);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground font-mono">
                            {field.key}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {field.fieldType}
                        </Badge>
                        {field.required && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs">
                            Required
                          </Badge>
                        )}
                        {field.options.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {field.options.length} option{field.options.length !== 1 ? "s" : ""}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(field.id)}
                          title="Delete field"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Field</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Field Name</label>
              <Input
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm({ ...form, name, key: slugify(name) });
                }}
                placeholder="e.g. Company Size"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Key</label>
              <Input
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="auto-generated"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from name. Used as the field identifier.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={form.fieldType}
                onValueChange={(v) => setForm({ ...form, fieldType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((ft) => (
                    <SelectItem key={ft} value={ft}>
                      {ft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(form.fieldType === "SELECT" || form.fieldType === "MULTI_SELECT") && (
              <div>
                <label className="text-sm font-medium">Options</label>
                <Input
                  value={form.options}
                  onChange={(e) => setForm({ ...form, options: e.target.value })}
                  placeholder="Option 1, Option 2, Option 3"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list of options
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required-toggle"
                checked={form.required}
                onChange={(e) => setForm({ ...form, required: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="required-toggle" className="text-sm font-medium">
                Required field
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
