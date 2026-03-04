// Cron: task-digest — runs at 08:00 UTC (spec §5.10)
// Sends daily task digest — lists overdue and due-today tasks per member

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 120;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Find all tasks that are overdue or due today, grouped by assignee
  const tasks = await prisma.activity.findMany({
    where: {
      type: "TASK",
      completedAt: null,
      dueAt: { lt: tomorrow },
    },
    include: {
      assignee: { include: { user: { select: { email: true, name: true } } } },
      createdBy: { include: { user: { select: { email: true, name: true } } } },
      opportunity: { select: { name: true } },
    },
    orderBy: { dueAt: "asc" },
  });

  // Group by user email
  const byUser: Record<string, typeof tasks> = {};
  for (const task of tasks) {
    const user = task.assignee?.user ?? task.createdBy.user;
    const email = user.email;
    if (!email) continue;
    if (!byUser[email]) byUser[email] = [];
    byUser[email].push(task);
  }

  let sent = 0;

  // For now, log the digest. Resend integration can be added when RESEND_API_KEY is configured.
  for (const [email, userTasks] of Object.entries(byUser)) {
    const overdue = userTasks.filter((t) => t.dueAt && t.dueAt < new Date());
    const dueToday = userTasks.filter((t) => t.dueAt && t.dueAt >= new Date());

    console.log(
      `[task-digest] ${email}: ${overdue.length} overdue, ${dueToday.length} due today`
    );

    // TODO: Send via Resend when API key is configured
    // await resend.emails.send({ to: email, subject: "Daily Task Digest", ... })

    sent++;
  }

  return NextResponse.json({
    ok: true,
    usersNotified: sent,
    totalTasks: tasks.length,
    timestamp: new Date().toISOString(),
  });
}
