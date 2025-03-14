'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  LogOut,
  UserPlus,
  Lock,
  UserCog,
  AlertCircle,
  UserMinus,
  Mail,
  CheckCircle,
  DollarSign,
  Coins,
  type LucideIcon,
} from 'lucide-react';

import { ActivityType } from './types';



/**
 * Activity Log structure with optional meta fields.
 */
interface ActivityLog {
  id: string;
  action: ActivityType;
  timestamp: string;
  ipAddress?: string;
  meta?: Record<string, any>;
}

/**
 * Map each ActivityType to a Lucide icon.
 */
const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,

  [ActivityType.DEPOSIT]: DollarSign,
  [ActivityType.WITHDRAW]: Coins,
  [ActivityType.AUTOMATION_CHANGE]: Settings,
};

/**
 * Convert a timestamp into a relative time string (e.g., "2 hours ago").
 */
function getRelativeTime(date: Date) {
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;
  return date.toLocaleDateString();
}

/**
 * Formats log descriptions with meta details for deposits, withdrawals, and automation changes.
 */
function formatAction(log: ActivityLog): string {
  const { action, meta } = log;
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new team';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a team member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a team member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';

    case ActivityType.DEPOSIT:
      return `Account ${meta?.accountMask || '*****????'} deposited $${meta?.amount?.toFixed(2)}`;
    case ActivityType.WITHDRAW:
      return `Account ${meta?.accountMask || '*****????'} withdrew $${meta?.amount?.toFixed(2)}`;
    case ActivityType.AUTOMATION_CHANGE: {
      const oldPurchase = meta?.oldPurchaseType ? `from ${meta.oldPurchaseType} (%) ` : '';
      const newPurchase = meta?.newPurchaseType ? `to ${meta.newPurchaseType} (#) ` : '';
      const note = meta?.note ? `(${meta.note})` : '';
      return `Automation changed ${oldPurchase}${newPurchase}${note}`;
    }

    default:
      return 'Unknown action occurred';
  }
}

/**
 * Client Component: Activity Page (fetches logs on mount)
 */
export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetches activity logs on page load.
   */
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      const fakeLogs: ActivityLog[] = [
        {
          id: '1',
          action: ActivityType.SIGN_IN,
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.10',
        },
        {
          id: '2',
          action: ActivityType.DEPOSIT,
          timestamp: new Date(Date.now() - 10 * 60_000).toISOString(),
          meta: { accountMask: '*****3422', amount: 250.0 },
        },
        {
          id: '3',
          action: ActivityType.WITHDRAW,
          timestamp: new Date(Date.now() - 60 * 60_000).toISOString(),
          meta: { accountMask: '*****3422', amount: 120.0 },
        },
        {
          id: '4',
          action: ActivityType.AUTOMATION_CHANGE,
          timestamp: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
          meta: { oldPurchaseType: 'percent', newPurchaseType: 'shares' },
        },
        {
          id: '5',
          action: ActivityType.AUTOMATION_CHANGE,
          timestamp: new Date(Date.now() - 24 * 60 * 60_000).toISOString(),
          meta: { note: 'Per asset cap protection enabled' },
        },
      ];

      // Sort logs in descending order (most recent first)
      setLogs(
        fakeLogs.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
      setLoading(false);
    }

    fetchLogs();
  }, []);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading activity...</p>
          ) : logs.length > 0 ? (
            <ul className="space-y-4">
              {logs.map((log) => {
                const Icon = iconMap[log.action] || Settings;
                const description = formatAction(log);

                return (
                  <li key={log.id} className="flex items-center space-x-4">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {description}
                        {log.ipAddress && ` from IP ${log.ipAddress}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No activity yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                When you perform actions like depositing funds or changing
                automations, they’ll appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
