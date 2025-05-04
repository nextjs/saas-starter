import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { apiKeys, ActivityType } from '@/lib/db/schema';
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import { API_PREFIX } from '@/lib/constants';
import { randomBytes } from 'crypto';
import { logActivity } from '@/lib/db/activity';

// 获取当前用户的所有API密钥
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    return NextResponse.json({ error: '未找到团队' }, { status: 404 });
  }

  const keys = await db.query.apiKeys.findMany({
    where: (apiKeys, { eq, and, isNull }) => 
      and(
        eq(apiKeys.teamId, userWithTeam.teamId as number),
        isNull(apiKeys.revokedAt)
      )
  });

  // 处理密钥，只返回前缀和后6位
  const processedKeys = keys.map(key => {
    const fullKey = key.key;
    let maskedKey = key.prefix;
    
    if (fullKey && fullKey.length > 6) {
      // 添加省略号和最后6位字符
      maskedKey += '....' + fullKey.slice(-6);
    }
    
    return {
      ...key,
      key: maskedKey
    };
  });

  return NextResponse.json(processedKeys);
}

// 创建新的API密钥
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  const userWithTeam = await getUserWithTeam(user.id);
  if (!userWithTeam?.teamId) {
    return NextResponse.json({ error: '未找到团队' }, { status: 404 });
  }

  const { name, permissions, expiresAt } = await request.json();

  if (!name) {
    return NextResponse.json({ error: '密钥名称不能为空' }, { status: 400 });
  }

  // 生成API密钥
  const keyBuffer = randomBytes(32);
  const key = keyBuffer.toString('base64');
  
  // 确保前缀不超过10个字符
  // 使用较短的随机字符串，确保总长度不超过10
  const randomSuffix = randomBytes(3).toString('hex').substring(0, 6);
  const prefix = `${API_PREFIX.substring(0, 3)}_${randomSuffix}`;
  
  // 确保前缀不超过10个字符
  if (prefix.length > 10) {
    console.warn(`Generated prefix "${prefix}" is ${prefix.length} characters long, exceeding the 10 character limit`);
    return NextResponse.json({ error: 'Generated prefix exceeds 10 characters limit' }, { status: 500 });
  }

  const newKey = await db.insert(apiKeys).values({
    userId: user.id,
    teamId: userWithTeam.teamId as number,
    name,
    key: `${prefix}_${key}`,
    prefix,
    permissions: permissions || ['read'],
    expiresAt: expiresAt ? new Date(expiresAt) : null,
  }).returning();

  // 记录活动
  await logActivity(
    userWithTeam.teamId as number,
    user.id,
    ActivityType.CREATE_API_KEY
  );

  return NextResponse.json(newKey[0]);
}
