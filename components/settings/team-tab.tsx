'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamMembers } from '@/lib/mock-data';
import { TeamRole } from '@/lib/types';

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  owner: 'default',
  admin: 'secondary',
  editor: 'outline',
  viewer: 'outline',
};

export function TeamTab() {
  const [members] = useState(teamMembers);
  const [approvalMode, setApprovalMode] = useState<'simple' | 'strict'>('simple');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage who has access and their roles.
          </p>
        </div>
        <Button size="sm">
          <UserPlus className="mr-1 h-4 w-4" strokeWidth={1.75} />
          Invite member
        </Button>
      </div>
      <Separator />

      <div className="space-y-3">
        {members.map((member) => (
          <Card key={member.id}>
            <CardContent className="flex items-center gap-4 py-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="text-xs">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{member.name}</span>
                  <Badge variant={roleBadgeVariant[member.role]}>
                    {member.role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              {member.role !== TeamRole.Owner && (
                <div className="flex items-center gap-2">
                  <Select defaultValue={member.role}>
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Approval Workflow */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Approval Workflow</h3>
          <p className="text-sm text-muted-foreground">
            Choose how content gets approved before publishing.
          </p>
        </div>
        <RadioGroup
          value={approvalMode}
          onValueChange={(v) => setApprovalMode(v as 'simple' | 'strict')}
          className="space-y-3"
        >
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <RadioGroupItem value="simple" id="simple" className="mt-0.5" />
            <div className="space-y-1">
              <Label htmlFor="simple" className="font-medium">
                Simple Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                AI-generated content: Editor approves and publishes directly.
                Editor-written content: AI runs Brand Voice Check. If match &gt; 85%, publishes directly. Below 85%, requires Owner/Admin approval.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <RadioGroupItem value="strict" id="strict" className="mt-0.5" />
            <div className="space-y-1">
              <Label htmlFor="strict" className="font-medium">
                Strict Mode
              </Label>
              <p className="text-xs text-muted-foreground">
                All content must pass AI Brand Voice Check and then be approved by an Owner or Admin before publishing. No exceptions.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end pt-4">
        <Button>Save changes</Button>
      </div>
    </div>
  );
}
