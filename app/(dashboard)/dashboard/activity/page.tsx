import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

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
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
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
    default:
      return 'Unknown action occurred';
  }
}

export default async function ActivityPage() {
  const logs = await getActivityLogs();

  return (
    <section className="flex-1 p-4 lg:p-8 bg-black">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 border-2 border-gold rounded-lg">
          <Activity className="size-6 text-gold" />
        </div>
        <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white uppercase italic">
          Activity <span className="text-gold">Log</span>
        </h1>
      </div>

      <Card className="bg-zinc-950 border-zinc-800 rounded-3xl overflow-hidden max-w-3xl shadow-xl">
        <CardHeader className="border-b border-zinc-900 pb-6">
          <CardTitle className="text-white text-xl uppercase italic font-black">Recent Activity</CardTitle>
          <CardDescription className="text-zinc-500">A historical record of your account actions and security events.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          {logs.length > 0 ? (
            <ul className="space-y-6">
              {logs.map((log) => {
                const Icon = iconMap[log.action as ActivityType] || Settings;
                const formattedAction = formatAction(
                  log.action as ActivityType
                );

                return (
                  <li key={log.id} className="flex items-start space-x-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-full p-2.5 flex-shrink-0">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white leading-snug">
                        {formattedAction}
                        {log.ipAddress && (
                          <span className="ml-1 text-zinc-500 font-normal">
                            from IP {log.ipAddress}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-medium">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 mb-6">
                <AlertCircle className="h-12 w-12 text-zinc-700 mx-auto" />
              </div>
              <h3 className="text-lg font-black text-white mb-2 uppercase italic tracking-tight">
                No activity recorded
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                Your future interactions with LyricFlow will be securely logged and displayed here for your review.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
