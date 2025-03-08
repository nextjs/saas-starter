'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { InviteTeamMember } from './invite-team';

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  // Get the owner (first member) of the team
  const teamOwner = teamData.teamMembers.length > 0 ? teamData.teamMembers[0] : null;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Team Settings</h1>
      
      {/* Organization Information Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-medium">Organization Name: {teamData.name}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(teamData.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last Updated: {new Date(teamData.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline">
                Manage Organization
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Subscription Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-medium">
                  Current Plan: {teamData.planName || 'Free'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {teamData.subscriptionStatus === 'active'
                    ? 'Billed monthly'
                    : teamData.subscriptionStatus === 'trialing'
                      ? 'Trial period'
                      : 'No active subscription'}
                </p>
                {teamData.stripeCustomerId && (
                  <p className="text-sm text-muted-foreground">
                    Customer ID: {teamData.stripeCustomerId}
                  </p>
                )}
              </div>
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Manage Subscription
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Owner Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Team Owner</CardTitle>
        </CardHeader>
        <CardContent>
          {teamOwner ? (
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage
                  src={`/placeholder.svg?height=32&width=32`}
                  alt={getUserDisplayName(teamOwner.user)}
                />
                <AvatarFallback>
                  {getUserDisplayName(teamOwner.user)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {getUserDisplayName(teamOwner.user)}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {teamOwner.role}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No team owner found</p>
          )}
        </CardContent>
      </Card>
      
      {/* Invite Team Member Card */}
      <InviteTeamMember />
    </section>
  );
}
