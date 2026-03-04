"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface Member {
  id: string;
  role: string;
  joinedAt: string;
  user: { name: string | null; email: string; image: string | null };
  salesTeams: Array<{ salesTeam: { name: string } }>;
}

const ROLES = ["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"] as const;

export default function MembersSettingsPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspace/members")
      .then((r) => r.json())
      .then((d) => setMembers(d.members ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(memberId: string, role: string) {
    setSaving(memberId);
    try {
      const res = await fetch("/api/workspace/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, role }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === memberId ? { ...m, role } : m))
        );
      }
    } finally {
      setSaving(null);
    }
  }

  if (loading)
    return (
      <div className="p-6">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Team Members</h1>
        <Badge variant="secondary">{members.length} members</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" /> Member Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-muted-foreground">No members found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {m.user.image ? (
                          <img
                            src={m.user.image}
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                            {(m.user.name ?? m.user.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {m.user.name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {m.user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={m.role}
                        disabled={saving === m.id || m.role === "OWNER"}
                        onChange={(e) => changeRole(m.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {m.salesTeams.length > 0
                          ? m.salesTeams.map((st, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {st.salesTeam.name}
                              </Badge>
                            ))
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(m.joinedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {m.role !== "OWNER" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm("Remove this member from the workspace?")) {
                              fetch(`/api/workspace/members?memberId=${m.id}`, {
                                method: "DELETE",
                              }).then((res) => {
                                if (res.ok)
                                  setMembers((prev) =>
                                    prev.filter((x) => x.id !== m.id)
                                  );
                              });
                            }
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
