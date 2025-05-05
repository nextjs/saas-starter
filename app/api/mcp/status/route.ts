import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { apiKeys } from '@/lib/db/schema';
import { and, eq, isNull, gt, or } from 'drizzle-orm';

export async function GET(req: NextRequest) {
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
        )
    });
    
    if (!key) {
      return NextResponse.json({ error: 'API Key无效或已过期' }, { status: 401 });
    }
    
    // 这里可以添加实际的MCP Server状态检查逻辑
    // 例如，尝试连接到MCP Server或执行一个简单的操作
    
    // 模拟检查MCP Server状态
    const isMCPServerOnline = true; // 实际应用中，这里应该是真实的检查结果
    
    if (isMCPServerOnline) {
      return NextResponse.json({ 
        status: 'online',
        message: 'MCP Server运行正常'
      });
    } else {
      return NextResponse.json({ 
        status: 'offline',
        error: 'MCP Server当前不可用'
      }, { status: 503 });
    }
    
  } catch (error) {
    console.error('检查MCP Server状态时出错:', error);
    return NextResponse.json({ 
      status: 'error',
      error: '服务器错误'
    }, { status: 500 });
  }
}