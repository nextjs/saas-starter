"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, UserPlus, Users } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: { name: string | null; email: string; image: string | null };
}

interface TeamMember {
  id: string;
  member: Member;
}

interface SalesTeam {
  id: string;
  name: string;
  managerId: string | null;
  manager: Member | null;
  members: TeamMember[];
}

export default function TeamsSettingsPage() {
  const [teams, setTeams] = useState<SalesTeam[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", managerId: "" });
  const [addingMemberTo, setAddingMemberTo] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [teamsRes, membersRes] = await Promise.all([
      fetch("/api/workspace/teams"),
      fetch("/api/workspace/members"),
    ]);
    const teamsData = await teamsRes.json();
    const membersData = await membersRes.json();
    setTeams(teamsData.teams ?? []);
    setAllMembers(membersData.members ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!form.name) return;
    setError(null);
    try {
      const res = await fetch("/api/workspace/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          managerId: form.managerId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Failed to create team");
        return;
      }
      setShowCreate(false);
      setForm({ name: "", managerId: "" });
      loadData();
    } catch {
      setError("Network error — please try again");
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm("Delete this team? Members will be unassigned.")) return;
    const res = await fetch(`/api/workspace/teams?teamId=${teamId}`, { method: "DELETE" });
    if (res.ok) loadData();
  };

  const handleAddMember = async (teamId: string) => {
    if (!selectedMemberId) return;
    const res = await fetch("/api/workspace/teams/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, memberId: selectedMemberId }),
    });
    if (res.ok) {
      setAddingMemberTo(null);
      setSelectedMemberId("");
      loadData();
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string) => {
    const res = await fetch(`/api/workspace/teams/members?teamId=${teamId}&memberId=${memberId}`, {
      method: "DELETE",
    });
    if (res.ok) loadData();
  };

  const memberName = (m: Member) => m.user.name ?? m.user.email;

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse h-8 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sales Teams</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Team
        </Button>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No teams yet. Create one to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {teams.map((team) => {
            const teamMemberIds = new Set(team.members.map((tm) => tm.member.id));
            const availableMembers = allMembers.filter((m) => !teamMemberIds.has(m.id));

            return (
              <Card key={team.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(team.id)}
                      title="Delete team"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {team.manager && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Manager:</span>{" "}
                      <span className="font-medium">{memberName(team.manager)}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    {team.members.map((tm) => (
                      <div
                        key={tm.id}
                        className="flex items-center justify-between py-1.5 px-3 rounded-md bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          {tm.member.user.image ? (
                            <img
                              src={tm.member.user.image}
                              alt=""
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                              {(tm.member.user.name ?? tm.member.user.email)[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm">{memberName(tm.member)}</span>
                          <Badge variant="outline" className="text-xs">
                            {tm.member.role}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 h-7 px-2"
                          onClick={() => handleRemoveMember(team.id, tm.member.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>

                  {addingMemberTo === team.id ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedMemberId}
                        onValueChange={setSelectedMemberId}
                      >
                        <SelectTrigger className="w-64">
                          <SelectValue placeholder="Select a member" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableMembers.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {memberName(m)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => handleAddMember(team.id)}>
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAddingMemberTo(null);
                          setSelectedMemberId("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAddingMemberTo(team.id)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" /> Add Member
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
          </DialogHeader>
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Team Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Enterprise Sales"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Manager</label>
              <Select
                value={form.managerId}
                onValueChange={(v) => setForm({ ...form, managerId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {allMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {memberName(m)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
