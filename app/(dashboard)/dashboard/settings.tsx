'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { useActionState } from 'react';
import { TeamDataWithMembers } from '@/lib/db/schema';

type ActionState = {
  error?: string;
  success?: string;
};

export function Settings({ teamData }: { teamData: TeamDataWithMembers }) {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Dashboard</h1>

      {/* Subscription Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
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

      {/* Portfolio View Placeholder */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Portfolio View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Portfolio view will be displayed here.</p>
        </CardContent>
      </Card>

      {/* Priority List Placeholder */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Priority List View</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Priority list details will be shown here.</p>
          <Button variant="outline">Update Priorities</Button>
        </CardContent>
      </Card>
    </section>
  );
}
