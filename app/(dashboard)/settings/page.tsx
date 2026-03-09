'use client';

import {
  User,
  Palette,
  Clock,
  MessageSquare,
  Radar,
  Bell,
  Users,
  CreditCard,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountTab } from '@/components/settings/account-tab';
import { BrandProfileTab } from '@/components/settings/brand-profile-tab';
import { ScheduleTab } from '@/components/settings/schedule-tab';
import { AutoReplyTab } from '@/components/settings/auto-reply-tab';
import { MonitorTab } from '@/components/settings/monitor-tab';
import { NotificationsTab } from '@/components/settings/notifications-tab';
import { TeamTab } from '@/components/settings/team-tab';
import { BillingTab } from '@/components/settings/billing-tab';

const tabs = [
  { value: 'account', label: 'Account', icon: User },
  { value: 'brand', label: 'Brand Profile', icon: Palette },
  { value: 'schedule', label: 'Schedule', icon: Clock },
  { value: 'auto-reply', label: 'Auto-Reply', icon: MessageSquare },
  { value: 'monitor', label: 'Monitor', icon: Radar },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'team', label: 'Team', icon: Users },
  { value: 'billing', label: 'Billing', icon: CreditCard },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 md:px-6 py-4">
        <h1 className="text-lg font-semibold font-heading sketchy-underline">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, brand, and preferences.
        </p>
      </div>

      <Tabs defaultValue="account" orientation="vertical" className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Desktop: vertical tabs on left. Mobile: horizontal scrollable pills at top. */}
        <TabsList
          variant="line"
          className="shrink-0 overflow-x-auto md:overflow-x-visible md:flex-col md:items-stretch md:w-52 md:border-r md:rounded-none md:px-2 md:py-4 md:h-auto border-b md:border-b-0 px-3 py-2 w-full gap-1 md:gap-0.5 scrollbar-hide"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="justify-start gap-2 px-3 py-2 text-sm shrink-0 rounded-full md:rounded-md min-h-[40px] md:min-h-0"
            >
              <tab.icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl p-4 md:p-6">
            <TabsContent value="account"><AccountTab /></TabsContent>
            <TabsContent value="brand"><BrandProfileTab /></TabsContent>
            <TabsContent value="schedule"><ScheduleTab /></TabsContent>
            <TabsContent value="auto-reply"><AutoReplyTab /></TabsContent>
            <TabsContent value="monitor"><MonitorTab /></TabsContent>
            <TabsContent value="notifications"><NotificationsTab /></TabsContent>
            <TabsContent value="team"><TeamTab /></TabsContent>
            <TabsContent value="billing"><BillingTab /></TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
