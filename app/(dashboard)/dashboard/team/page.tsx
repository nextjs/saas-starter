'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember } from '@/app/(login)/actions';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Users, CreditCard } from 'lucide-react';

type ActionState = {
  error?: string;
  success?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function SubscriptionSkeleton() {
  return (
    <Card className="bg-zinc-950 border-zinc-800 mb-8 h-[140px] animate-pulse">
      <CardHeader>
        <CardTitle className="text-white uppercase italic font-black">Team Subscription</CardTitle>
      </CardHeader>
    </Card>
  );
}

function ManageSubscription() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  return (
    <Card className="bg-zinc-950 border-zinc-800 mb-8 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <CreditCard className="size-4 text-gold" />
          <CardTitle className="text-white text-xl uppercase italic font-black">Team Subscription</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-white font-bold text-lg mb-1">
                Current Plan: <span className="text-gold">{teamData?.planName || 'Free'}</span>
              </p>
              <p className="text-zinc-500 text-sm">
                {teamData?.subscriptionStatus === 'active'
                  ? 'Billed monthly'
                  : teamData?.subscriptionStatus === 'trialing'
                  ? 'Trial period'
                  : 'No active subscription'}
              </p>
            </div>
            <form action={customerPortalAction} className="w-full sm:w-auto">
              <Button type="submit" className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 rounded-full font-black uppercase tracking-wider text-xs px-6 py-5">
                Manage Subscription
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="bg-zinc-950 border-zinc-800 mb-8 h-[140px] animate-pulse">
      <CardHeader>
        <CardTitle className="text-white uppercase italic font-black">Team Members</CardTitle>
      </CardHeader>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  const [removeState, removeAction, isRemovePending] = useActionState<
    ActionState,
    FormData
  >(removeTeamMember, {});

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="bg-zinc-950 border-zinc-800 mb-8">
        <CardHeader>
          <CardTitle className="text-white uppercase italic font-black">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-500 italic">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-950 border-zinc-800 mb-8 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-900">
        <CardTitle className="text-white text-xl uppercase italic font-black">Team Members</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-zinc-900">
          {teamData.teamMembers.map((member, index) => (
            <li key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
              <div className="flex items-center space-x-4">
                <Avatar className="size-12 border border-zinc-800">
                  <AvatarFallback className="bg-zinc-900 text-gold font-bold">
                    {getUserDisplayName(member.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">
                    {getUserDisplayName(member.user)}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>
              {index > 1 ? (
                <form action={removeAction} className="w-full sm:w-auto">
                  <input type="hidden" name="memberId" value={member.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isRemovePending}
                    className="w-full sm:w-auto border-zinc-800 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/50 rounded-full font-bold uppercase text-[10px] tracking-widest h-9"
                  >
                    {isRemovePending ? 'Removing...' : 'Remove'}
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
        {removeState?.error && (
          <p className="text-rose-500 mt-4 text-sm font-medium">{removeState.error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function InviteTeamMemberSkeleton() {
  return (
    <Card className="bg-zinc-950 border-zinc-800 h-[260px] animate-pulse">
      <CardHeader>
        <CardTitle className="text-white uppercase italic font-black">Invite Team Member</CardTitle>
      </CardHeader>
    </Card>
  );
}

function InviteTeamMember() {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  const isOwner = user?.role === 'owner';
  const [inviteState, inviteAction, isInvitePending] = useActionState<
    ActionState,
    FormData
  >(inviteTeamMember, {});

  return (
    <Card className="bg-zinc-950 border-zinc-800 shadow-xl overflow-hidden">
      <CardHeader className="border-b border-zinc-900">
        <CardTitle className="text-white text-xl uppercase italic font-black">Invite Team Member</CardTitle>
        <CardDescription className="text-zinc-500">Add new collaborators to your songwriting workspace.</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <form action={inviteAction} className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-400 font-bold uppercase tracking-wider text-xs">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
              disabled={!isOwner}
              className="bg-zinc-900 border-zinc-800 text-white rounded-xl h-12"
            />
          </div>
          <div className="space-y-4">
            <Label className="text-zinc-400 font-bold uppercase tracking-wider text-xs">Role Selection</Label>
            <RadioGroup
              defaultValue="member"
              name="role"
              className="flex flex-col sm:flex-row gap-6"
              disabled={!isOwner}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="member" id="member" className="border-zinc-700 text-gold" />
                <Label htmlFor="member" className="font-bold text-zinc-300 cursor-pointer text-sm">Member</Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="owner" id="owner" className="border-zinc-700 text-gold" />
                <Label htmlFor="owner" className="font-bold text-zinc-300 cursor-pointer text-sm">Owner</Label>
              </div>
            </RadioGroup>
          </div>

          {inviteState?.error && (
            <p className="text-rose-500 text-sm font-medium">{inviteState.error}</p>
          )}
          {inviteState?.success && (
            <p className="text-emerald-500 text-sm font-medium">{inviteState.success}</p>
          )}

          <Button
            type="submit"
            className="w-full sm:w-auto bg-gold text-black hover:bg-yellow-500 rounded-full px-10 py-6 font-black tracking-widest uppercase transition-all"
            disabled={isInvitePending || !isOwner}
          >
            {isInvitePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Invite Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
      {!isOwner && (
        <CardFooter className="border-t border-zinc-900 bg-zinc-900/20">
          <p className="text-xs text-zinc-500 italic">
            Note: You must be a team owner to invite new members to this workspace.
          </p>
        </CardFooter>
      )}
    </Card>
  );
}

export default function TeamPage() {
  return (
    <section className="flex-1 p-4 lg:p-8 bg-black">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 border-2 border-gold rounded-lg">
          <Users className="size-6 text-gold" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
          Team <span className="text-gold">Settings</span>
        </h1>
      </div>

      <div className="max-w-4xl">
        <Suspense fallback={<SubscriptionSkeleton />}>
          <ManageSubscription />
        </Suspense>
        <Suspense fallback={<TeamMembersSkeleton />}>
          <TeamMembers />
        </Suspense>
        <Suspense fallback={<InviteTeamMemberSkeleton />}>
          <InviteTeamMember />
        </Suspense>
      </div>
    </section>
  );
}
