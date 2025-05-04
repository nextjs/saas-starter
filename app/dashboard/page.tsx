'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import useSWR from 'swr';
import { Suspense } from 'react';
import { Activity, Users, Shield, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function StatCard({ title, value, description, icon: Icon }: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Stats() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard 
        title="Team Members" 
        value={teamData?.teamMembers?.length || 0} 
        description="Total active team members" 
        icon={Users} 
      />
      <StatCard 
        title="Current Plan" 
        value={teamData?.planName || 'Free'} 
        description={teamData?.subscriptionStatus === 'active' ? 'Billed monthly' : 'No active subscription'} 
        icon={DollarSign} 
      />
      <StatCard 
        title="API Calls" 
        value="0" 
        description="Total API calls this month" 
        icon={Activity} 
      />
      <StatCard 
        title="Security Status" 
        value="Good" 
        description="All systems operational" 
        icon={Shield} 
      />
    </div>
  );
}

function SubscriptionSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>团队订阅</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="mb-4 sm:mb-0">
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-9 w-36 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembersSkeleton() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>团队成员</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TeamMembers() {
  const { data: teamData } = useSWR<TeamDataWithMembers>('/api/team', fetcher);

  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Unknown User';
  };

  if (!teamData?.teamMembers?.length) {
    return (
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Link href="/dashboard/team">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No team members yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Members</CardTitle>
        <Link href="/dashboard/team">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {teamData.teamMembers.slice(0, 3).map((member) => (
            <li key={member.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>
                  {getUserDisplayName(member.user)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{getUserDisplayName(member.user)}</p>
                <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
        {teamData.teamMembers.length > 3 && (
          <div className="mt-4 text-center">
            <Link href="/dashboard/team">
              <Button variant="link" size="sm">View all {teamData.teamMembers.length} members</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityLogSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>最近活动</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityLog() {
  interface ActivityLogItem {
    id: number;
    action: string;
    timestamp: string;
    ipAddress?: string;
    userName?: string;
  }
  
  // Modified fetcher function to handle API response format
  const activityFetcher = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    // Check if API returns data wrapped in a data field
    return data.data || data;
  };
  
  const { data: logs, isLoading, error } = useSWR<ActivityLogItem[]>('/api/activity?limit=3', activityFetcher, {
    revalidateOnFocus: false,        // Disable revalidation on focus
    revalidateOnReconnect: false,    // Disable revalidation on reconnect
    refreshInterval: 0,              // Disable auto refresh
    dedupingInterval: 60000 * 60,    // No duplicate requests within 1 hour
    fallbackData: [],                // Provide default empty array to avoid undefined checks
    shouldRetryOnError: false        // Don't retry on error
  });

  // Format activity type using ActivityType enum
  const formatAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      'SIGN_UP': 'User Registration',
      'SIGN_IN': 'User Login',
      'SIGN_OUT': 'User Logout',
      'UPDATE_PASSWORD': 'Password Update',
      'DELETE_ACCOUNT': 'Account Deletion',
      'UPDATE_ACCOUNT': 'Account Update',
      'CREATE_TEAM': 'Team Creation',
      'REMOVE_TEAM_MEMBER': 'Team Member Removal',
      'INVITE_TEAM_MEMBER': 'Team Member Invitation',
      'ACCEPT_INVITATION': 'Invitation Accepted',
      'CREATE_API_KEY': 'API Key Creation',
      'REVOKE_API_KEY': 'API Key Revocation',
      'API_KEY_USED': 'API Key Used'
    };
    
    return actionMap[action] || 'Unknown Action';
  };

  // Add debug log
  console.log('Activity log data:', logs);

  if (isLoading) {
    return <ActivityLogSkeleton />;
  }

  if (error) {
    console.error('Activity log loading error:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Error loading activity records</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Link href="/dashboard/user-log">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        {logs && logs.length > 0 ? (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4">
                <div className="bg-orange-100 rounded-full p-2">
                  <Activity className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{formatAction(log.action)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No activity records yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function OverviewPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Overview</h1>
      
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
      
      <Suspense fallback={<SubscriptionSkeleton />}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">No API usage data available</p>
            </div>
          </CardContent>
        </Card>
      </Suspense>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<TeamMembersSkeleton />}>
          <TeamMembers />
        </Suspense>
        
        <Suspense fallback={<ActivityLogSkeleton />}>
          <ActivityLog />
        </Suspense>
      </div>
    </section>
  );
}
