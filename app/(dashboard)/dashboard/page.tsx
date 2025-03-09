import { redirect } from 'next/navigation';
import { Settings } from './settings';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeamData {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeProductId: string | null;
  planName: string | null;
  subscriptionStatus: string | null;
  teamMembers: Array<{
    id: number;
    userId: number;
    teamId: number;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
    return null; // This line is never reached but satisfies TypeScript
  }

  try {
    const teamData = await getTeamForUser(user.id);

    if (!teamData) {
      throw new Error('Team not found');
    }

    return <Settings teamData={teamData} />;
  } catch (error) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <Card className="border-destructive">
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <Button variant="orange" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
