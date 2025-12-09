'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Users, Activity, Key, Webhook, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  totalApiKeys: number;
  totalWebhooks: number;
  totalUploads: number;
  recentActivity: number;
  userGrowth: number;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalApiKeys: 0,
    totalWebhooks: 0,
    totalUploads: 0,
    recentActivity: 0,
    userGrowth: 0,
  });

  useEffect(() => {
    // In a real app, fetch from API
    // For now, using mock data
    setAnalytics({
      totalUsers: 12,
      totalApiKeys: 5,
      totalWebhooks: 3,
      totalUploads: 47,
      recentActivity: 156,
      userGrowth: 15,
    });
  }, []);

  const stats = [
    {
      title: 'Total Team Members',
      value: analytics.totalUsers,
      icon: Users,
      description: `+${analytics.userGrowth}% from last month`,
      trend: 'up',
    },
    {
      title: 'API Keys',
      value: analytics.totalApiKeys,
      icon: Key,
      description: 'Active API keys',
      trend: 'neutral',
    },
    {
      title: 'Webhooks',
      value: analytics.totalWebhooks,
      icon: Webhook,
      description: 'Configured webhooks',
      trend: 'neutral',
    },
    {
      title: 'Recent Activity',
      value: analytics.recentActivity,
      icon: Activity,
      description: 'Actions this month',
      trend: 'up',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your team's usage and activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stat.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                )}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Recent activity in your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'User signed in', count: 45, color: 'bg-blue-500' },
                { action: 'API key created', count: 12, color: 'bg-green-500' },
                { action: 'Files uploaded', count: 47, color: 'bg-purple-500' },
                { action: 'Webhooks triggered', count: 23, color: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.action} className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.action}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{item.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Current usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Storage', used: '2.4 GB', total: '10 GB', percentage: 24 },
                { name: 'API Calls', used: '1,245', total: '10,000', percentage: 12 },
                { name: 'Team Members', used: '12', total: '50', percentage: 24 },
              ].map((resource) => (
                <div key={resource.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{resource.name}</span>
                    <span className="text-muted-foreground">
                      {resource.used} / {resource.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${resource.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Recent events in your team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                time: '2 hours ago',
                action: 'New team member joined',
                user: 'John Doe',
              },
              {
                time: '5 hours ago',
                action: 'API key created',
                user: 'Jane Smith',
              },
              {
                time: '1 day ago',
                action: 'Webhook configured',
                user: 'Mike Johnson',
              },
              {
                time: '2 days ago',
                action: 'Subscription upgraded',
                user: 'Sarah Wilson',
              },
            ].map((event, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.user} • {event.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
