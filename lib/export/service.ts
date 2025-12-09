import { db } from '@/lib/db/drizzle';
import { users, teams, activityLogs, apiKeys, webhooks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function exportTeamData(teamId: number) {
  // Fetch all team data
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);

  const teamMembers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .innerJoin(db.$with('team_members'), eq(users.id, db.$with('team_members').userId))
    .where(eq(db.$with('team_members').teamId, teamId));

  const activities = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.teamId, teamId))
    .limit(1000);

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      createdAt: apiKeys.createdAt,
      lastUsedAt: apiKeys.lastUsedAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.teamId, teamId));

  const teamWebhooks = await db
    .select({
      id: webhooks.id,
      name: webhooks.name,
      url: webhooks.url,
      events: webhooks.events,
      createdAt: webhooks.createdAt,
    })
    .from(webhooks)
    .where(eq(webhooks.teamId, teamId));

  return {
    team: {
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      subscriptionStatus: team.subscriptionStatus,
      planName: team.planName,
    },
    members: teamMembers,
    activities,
    apiKeys: keys,
    webhooks: teamWebhooks,
    exportedAt: new Date().toISOString(),
  };
}

export function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => JSON.stringify(row[header] || '')).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

export function convertToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}
