import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { creditBatches, CreditSourceType } from '@/lib/db/schema';
import { and, eq, lte } from 'drizzle-orm';
import { addFreeCredits } from '@/lib/db/credits';

/**
 * 免费计划积分续期API
 * 此API端点检查并续期即将到期的免费计划积分批次
 * 应通过cron job每天调用一次
 */
export async function GET(request: NextRequest) {
  // 检查API密钥（简单安全措施）
  const apiKey = request.headers.get('x-api-key');
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || apiKey !== cronSecret) {
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 401 }
    );
  }
  
  try {
    // 获取当前日期
    const today = new Date();
    // 设置今天的结束时间（23:59:59）
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // 查询今天到期的免费计划积分批次
    const expiredBatches = await db
      .select({
        id: creditBatches.id,
        teamId: creditBatches.teamId
      })
      .from(creditBatches)
      .where(
        and(
          eq(creditBatches.source, CreditSourceType.FREE_PLAN),
          lte(creditBatches.expiresAt, endOfDay)
        )
      );
    
    // 为每个到期的批次创建新的免费积分批次
    const renewalPromises = expiredBatches.map(batch => 
      addFreeCredits(batch.teamId)
    );
    
    // 等待所有续期操作完成
    await Promise.all(renewalPromises);
    
    // 返回处理结果
    return NextResponse.json({
      success: true,
      renewed: expiredBatches.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // 记录错误并返回500服务器错误
    console.error('免费积分续期失败:', error);
    return NextResponse.json(
      { 
        error: '免费积分续期失败',
        message: (error as Error).message
      },
      { status: 500 }
    );
  }
}
