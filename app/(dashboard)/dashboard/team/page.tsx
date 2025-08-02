//<file path="app/(dashboard)/dashboard/team/page.tsx">
'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
    CardDescription
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState, useState, useEffect, useRef } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { removeTeamMember, inviteTeamMember, createTeam } from './actions';
import useSWR, { mutate } from 'swr';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, PlusCircle, Users } from 'lucide-react';

type ActionState = {
    error?: string;
    success?: string;
    data?: any;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function ManageSubscription({ team }: { team: TeamDataWithMembers }) {
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(customerPortalAction, {});

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Team Subscription</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                        <div className="mb-4 sm:mb-0">
                            <p className="font-medium">
                                Current Plan: {team.planName || 'Free'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {team.subscriptionStatus === 'active'
                                    ? 'Billed monthly'
                                    : team.subscriptionStatus === 'trialing'
                                        ? 'Trial period'
                                        : 'No active subscription'}
                            </p>
                        </div>
                        <form action={formAction}>
                            <input type="hidden" name="teamId" value={team.id} />
                            <Button type="submit" variant="outline" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting...
                                    </>
                                ) : 'Manage Subscription'
                                }
                            </Button>
                        </form>
                    </div>
                    {state?.error && <p className="text-sm text-red-500 mt-2">{state.error}</p>}
                </div>
            </CardContent>
        </Card>
    );
}

function TeamMembers({ team }: { team: TeamDataWithMembers }) {
    const [removeState, removeAction, isRemovePending] = useActionState<
        ActionState,
        FormData
    >(removeTeamMember, {});

    const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
        return user.name || user.email || 'Unknown User';
    };

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {team.teamMembers.map((member, index) => (
                        <li key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarFallback>
                                        {getUserDisplayName(member.user)
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {getUserDisplayName(member.user)}
                                    </p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                            {index > 1 ? (
                                <form action={removeAction}>
                                    <input type="hidden" name="memberId" value={member.id} />
                                    <Button
                                        type="submit"
                                        variant="outline"
                                        size="sm"
                                        disabled={isRemovePending}
                                    >
                                        {isRemovePending ? 'Removing...' : 'Remove'}
                                    </Button>
                                </form>
                            ) : null}
                        </li>
                    ))}
                </ul>
                {removeState?.error && (
                    <p className="text-red-500 mt-4">{removeState.error}</p>
                )}
            </CardContent>
        </Card>
    );
}

function InviteTeamMember({ team }: { team: TeamDataWithMembers }) {
    const { data: user } = useSWR<User>('/api/user', fetcher);
    const currentUserMembership = team.teamMembers.find(m => m.userId === user?.id);
    const isOwner = currentUserMembership?.role === 'owner';

    const [inviteState, inviteAction, isInvitePending] = useActionState<
        ActionState,
        FormData
    >(inviteTeamMember, {});

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={inviteAction} className="space-y-4">
                    <input type="hidden" name="teamId" value={team.id} />
                    <div>
                        <Label htmlFor="email" className="mb-2">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter email"
                            required
                            disabled={!isOwner}
                        />
                    </div>
                    <div>
                        <Label>Role</Label>
                        <RadioGroup
                            defaultValue="member"
                            name="role"
                            className="flex space-x-4"
                            disabled={!isOwner}
                        >
                            <div className="flex items-center space-x-2 mt-2">
                                <RadioGroupItem value="member" id="member" />
                                <Label htmlFor="member">Member</Label>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                                <RadioGroupItem value="owner" id="owner" />
                                <Label htmlFor="owner">Owner</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    {inviteState?.error && (
                        <p className="text-red-500">{inviteState.error}</p>
                    )}
                    {inviteState?.success && (
                        <p className="text-green-500">{inviteState.success}</p>
                    )}
                    <Button
                        type="submit"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
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
                <CardFooter>
                    <p className="text-sm text-muted-foreground">
                        You must be a team owner to invite new members.
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}

function CreateTeamDialog() {
    const [open, setOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [state, action, pending] = useActionState(createTeam, {});

    useEffect(() => {
        if (state.success) {
            mutate('/api/team'); // Re-fetch teams list
            setOpen(false);
            formRef.current?.reset();
        }
    }, [state.success]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />Create New Team</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Team</DialogTitle>
                    <DialogDescription>
                        Give your new team a name. You will be the owner.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} action={action} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Team Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Marketing Team" required />
                    </div>
                    {state.error && <p className="text-sm text-red-500">{state.error}</p>}
                    <DialogFooter>
                        <Button type="submit" disabled={pending}>
                            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : 'Create Team'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function SettingsPage() {
    const { data: teams, isLoading } = useSWR<TeamDataWithMembers[]>('/api/team', fetcher);
    const [selectedTeam, setSelectedTeam] = useState<TeamDataWithMembers | null>(null);

    useEffect(() => {
        if (teams && teams.length > 0 && !selectedTeam) {
            setSelectedTeam(teams[0]);
        }
    }, [teams, selectedTeam]);

    const handleTeamChange = (teamId: string) => {
        const team = teams?.find(t => t.id.toString() === teamId);
        if(team) setSelectedTeam(team);
    }

    if (isLoading) {
        return (
            <section className="flex-1 p-4 lg:p-8">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
                <Card className="h-40 animate-pulse"></Card>
            </section>
        )
    }

    if (!teams || teams.length === 0) {
        return (
            <section className="flex-1 p-4 lg:p-8 flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <Users className="mx-auto h-12 w-12 text-gray-400"/>
                        <CardTitle>No Teams Found</CardTitle>
                        <CardDescription>You are not a member of any team yet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CreateTeamDialog />
                    </CardContent>
                </Card>
            </section>
        )
    }

    return (
        <section className="flex-1 p-4 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div className='flex items-center gap-4'>
                    <h1 className="text-lg lg:text-2xl font-medium">Team Settings</h1>
                    <Select onValueChange={handleTeamChange} defaultValue={selectedTeam?.id.toString()}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                        <SelectContent>
                            {teams.map(team => (
                                <SelectItem key={team.id} value={team.id.toString()}>{team.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="mt-4 sm:mt-0">
                    <CreateTeamDialog />
                </div>
            </div>

            {selectedTeam ? (
                <>
                    <ManageSubscription team={selectedTeam} />
                    <TeamMembers team={selectedTeam} />
                    <InviteTeamMember team={selectedTeam} />
                </>
            ) : (
                <Card>
                    <CardContent className="flex items-center justify-center h-40">
                        <p className="text-muted-foreground">Select a team to view its details.</p>
                    </CardContent>
                </Card>
            )}
        </section>
    );
}