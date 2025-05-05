import { NextRequest, NextResponse } from 'next/server';
import { getWeatherInfo } from '@/lib/mcp/weather';
import { db } from '@/lib/db/drizzle';
import { apiKeys, apiUsage } from '@/lib/db/schema';
import { and, eq, isNull, gt, or } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    // 从请求头获取API Key
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未提供API Key' }, { status: 401 });
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
        ),
      with: {
        team: true
      }
    });
    
    if (!key) {
      return NextResponse.json({ error: 'API Key无效或已过期' }, { status: 401 });
    }
    
    // 更新最后使用时间
    await db.update(apiKeys)
      .set({ lastUsed: new Date() })
      .where(eq(apiKeys.id, key.id));
    
    // 解析请求体
    const { prompt } = await req.json();
    
    // 处理请求
    let result;
    let creditsConsumed = 1; // 默认消耗1个积分
    
    if (/天气/.test(prompt)) {
      result = await getWeatherInfo(prompt);
      creditsConsumed = 2; // 天气查询消耗2个积分
    } else {
      result = {
        role: 'assistant',
        type: 'text',
        content: `你说的是："${prompt}"，目前我只支持查天气功能。`,
      };
    }
    
    // 记录API使用情况
    await db.insert(apiUsage).values({
      teamId: key.teamId,
      userId: key.userId,
      apiKeyId: key.id,
      endpoint: '/api/mcp',
      creditsConsumed: creditsConsumed,
      executionTimeMs: 0, // 可以添加执行时间计算
      responseStatus: 200,
      requestId: crypto.randomUUID(),
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '未知',
      timestamp: new Date(),
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('MCP API错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
