import { NextResponse } from 'next/server';
import { getUserApiUsageStats } from '@/lib/db/queries';

/**
 * 获取当前用户团队的API使用统计信息
 * 此API端点返回当前用户团队的API调用总数
 */
export async function GET() {
  try {
    // 从数据库获取当前用户团队的API使用统计信息
    const stats = await getUserApiUsageStats();
    
    // 以JSON格式返回统计数据
    return NextResponse.json(stats);
  } catch (error) {
    // 如果是认证错误，返回401未授权
    if ((error as Error).message === '用户未认证') {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }
    
    // 如果是团队关联错误，返回404未找到
    if ((error as Error).message === '用户未关联团队') {
      return NextResponse.json(
        { error: '未找到团队' },
        { status: 404 }
      );
    }
    
    // 其他错误返回500服务器错误
    console.error('获取API使用统计失败:', error);
    return NextResponse.json(
      { error: '获取API使用统计失败' },
      { status: 500 }
    );
  }
}