"use client";

import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { X, Plus, Loader2 } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface AssignedTag {
  tag: Tag;
}

interface TagManagerProps {
  entityId: string;
  entityType: "CONTACT" | "CRM_ACCOUNT" | "OPPORTUNITY";
  assignedTags: AssignedTag[];
  onUpdate: () => void;
}

export function TagManager({
  entityId,
  entityType,
  assignedTags,
  onUpdate,
}: TagManagerProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAvailableTags();
  }, []);

  async function fetchAvailableTags() {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/tags");
      if (res.ok) {
        const data = await res.json();
        setAvailableTags(data.tags ?? data ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  }

  async function assignTag(tagId: string) {
    setActionLoading(tagId);
    try {
      const res = await fetch("/api/workspace/tags/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, entityType, entityId }),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to assign tag:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function removeTag(tagId: string) {
    setActionLoading(tagId);
    try {
      const res = await fetch("/api/workspace/tags/assign", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagId, entityType, entityId }),
      });
      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to remove tag:", error);
    } finally {
      setActionLoading(null);
    }
  }

  const assignedTagIds = new Set(assignedTags.map((at) => at.tag.id));
  const unassignedTags = availableTags.filter(
    (tag) => !assignedTagIds.has(tag.id)
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {assignedTags.map(({ tag }) => (
        <Badge
          key={tag.id}
          className="gap-1 pr-1"
          style={{
            backgroundColor: `${tag.color}20`,
            color: tag.color,
            borderColor: `${tag.color}40`,
          }}
        >
          {tag.name}
          <button
            type="button"
            onClick={() => removeTag(tag.id)}
            disabled={actionLoading === tag.id}
            className="ml-0.5 rounded-sm hover:bg-black/10 p-0.5 disabled:opacity-50"
            aria-label={`Remove tag ${tag.name}`}
          >
            {actionLoading === tag.id ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <X className="size-3" />
            )}
          </button>
        </Badge>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 rounded-full p-0"
            aria-label="Add tag"
          >
            <Plus className="size-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
            Assign a tag
          </p>
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : unassignedTags.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No tags available
            </p>
          ) : (
            <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
              {unassignedTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    assignTag(tag.id);
                    setOpen(false);
                  }}
                  disabled={actionLoading === tag.id}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50 text-left"
                >
                  <span
                    className="size-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
