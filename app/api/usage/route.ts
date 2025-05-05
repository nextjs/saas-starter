import { NextRequest, NextResponse } from 'next/server';
import { getUserApiUsage, getUserApiUsageCount } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 验证参数
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      );
    }

    // 并行获取数据和总数
    const [data, total] = await Promise.all([
      getUserApiUsage({ page, limit }),
      getUserApiUsageCount()
    ]);

    // 计算总页数
    const totalPages = Math.ceil(total / limit);

    // 返回分页数据
    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('获取API使用记录失败:', error);
    
    // 返回错误响应
    return NextResponse.json(
      { error: '获取API使用记录失败' },
      { status: 500 }
    );
  }
}