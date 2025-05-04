import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { apiKeys, ActivityType } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { logActivity } from '@/lib/db/activity';

// 撤销API密钥
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id;
  const keyId = parseInt(id);
  if (isNaN(keyId)) {
    return NextResponse.json({ error: '无效的密钥ID' }, { status: 400 });
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    return NextResponse.json({ error: '未找到团队' }, { status: 404 });
  }

  // 验证密钥属于当前用户的团队
  const key = await db.query.apiKeys.findFirst({
    where: (apiKeys, { eq, and }) => 
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.teamId, userWithTeam.teamId as number)
      )
  });

  if (!key) {
    return NextResponse.json({ error: '未找到API密钥' }, { status: 404 });
  }

  // 软删除密钥（设置revokedAt）
  await db.update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(eq(apiKeys.id, keyId));

  // 记录活动
  await logActivity(
    userWithTeam.teamId as number,
    user.id,
    ActivityType.REVOKE_API_KEY
  );

  return NextResponse.json({ success: true });
}
