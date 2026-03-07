'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

const plan = {
  name: 'Growth',
  price: '$29/mo',
  features: [
    '2 identities',
    'All platforms',
    '200 AI-generated posts/mo',
    'Auto-reply',
    'Monitor',
    'Priority support',
  ],
};

const usage = {
  identities: { used: 2, max: 2 },
  posts: { used: 47, max: 200 },
  aiCalls: { used: 312, max: 1000 },
};

export function BillingTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Plan & Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and view usage.
        </p>
      </div>
      <Separator />

      {/* Current Plan */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Plan</CardTitle>
            <Badge>{plan.name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-bold">{plan.price}</p>
          <ul className="grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-xs text-green-600">&#10003;</span>
                {f}
              </li>
            ))}
          </ul>
          <div className="flex gap-2 pt-2">
            <Button>Upgrade</Button>
            <Button variant="outline">Manage subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Usage This Month</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="py-4 space-y-2">
              <p className="text-xs text-muted-foreground">Identities</p>
              <p className="text-lg font-semibold">
                {usage.identities.used}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}/ {usage.identities.max}
                </span>
              </p>
              <Progress
                value={(usage.identities.used / usage.identities.max) * 100}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 space-y-2">
              <p className="text-xs text-muted-foreground">Posts This Month</p>
              <p className="text-lg font-semibold">
                {usage.posts.used}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}/ {usage.posts.max}
                </span>
              </p>
              <Progress
                value={(usage.posts.used / usage.posts.max) * 100}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 space-y-2">
              <p className="text-xs text-muted-foreground">AI Calls</p>
              <p className="text-lg font-semibold">
                {usage.aiCalls.used}
                <span className="text-sm font-normal text-muted-foreground">
                  {' '}/ {usage.aiCalls.max}
                </span>
              </p>
              <Progress
                value={(usage.aiCalls.used / usage.aiCalls.max) * 100}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
