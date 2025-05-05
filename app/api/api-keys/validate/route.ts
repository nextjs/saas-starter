import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { apiKeys } from '@/lib/db/schema';
import { and, eq, isNull, gt, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // 从请求头获取API Key
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ valid: false, error: '未提供API Key' }, { status: 401 });
    }
    
    const apiKey = authHeader.substring(7); // 去掉 'Bearer ' 前缀
    
    // 查询数据库验证API Key
    const key = await db.query.apiKeys.findFirst({
      where: (keys, { and, eq, isNull, gt, or }) => 
        and(
          eq(keys.key, apiKey),
          isNull(keys.revokedAt),
          or(
            isNull(keys.expiresAt),
            gt(keys.expiresAt, new Date())
          )
        )
    });
    
    if (!key) {
      return NextResponse.json({ valid: false, error: 'API Key无效或已过期' }, { status: 401 });
    }
    
    // 更新最后使用时间
    await db.update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, key.id));
    
    // API Key有效
    return NextResponse.json({ 
      valid: true, 
      permissions: key.permissions 
    });
    
  } catch (error) {
    console.error('验证API Key时出错:', error);
    return NextResponse.json({ valid: false, error: '服务器错误' }, { status: 500 });
  }
}
