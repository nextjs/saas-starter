import { NextResponse } from 'next/server';
import { getUser, getUserWithTeam, getActivityLogs, getActivityLogsCount } from '@/lib/db/queries';
import { ActivityType } from '@/lib/db/schema';
import { logActivity } from '@/lib/db/activity';

/**
 * 处理活动日志的GET请求
 * 支持分页、按活动类型筛选、日期范围筛选和关键词搜索
 */
export async function GET(request: Request) {
  try {
    // 获取当前登录用户
    const user = await getUser();

    // 如果用户未登录，返回401未授权错误
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析URL查询参数
    const { searchParams } = new URL(request.url);

    // 提取查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // 修复类型错误：将 null 转换为 undefined
    const actionParam = searchParams.get('action');
    const action = actionParam ? (actionParam as ActivityType) : undefined;

    const startDateParam = searchParams.get('startDate');
    const startDate = startDateParam ? new Date(startDateParam) : undefined;

    const endDateParam = searchParams.get('endDate');
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const searchParam = searchParams.get('search');
    const search = searchParam || undefined;

    // 使用查询函数获取活动日志
    const [logs, total] = await Promise.all([
      getActivityLogs({
        page,
        limit,
        action,
        startDate,
        endDate,
        search
      }),
      getActivityLogsCount({
        action,
        startDate,
        endDate,
        search
      })
    ]);

    // 计算总页数
    const totalPages = Math.ceil(total / limit);

    // 返回包含分页信息的响应
    return NextResponse.json({
      data: logs,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    // 捕获并记录错误
    console.error('Error fetching activity logs:', error);
    // 返回500服务器错误
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

/**
 * 处理活动日志的POST请求
 * 创建新的活动日志记录
 */
export async function POST(request: Request) {
  try {
    // 获取当前登录用户
    const user = await getUser();

    // 如果用户未登录，返回401未授权错误
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户所属团队信息
    const userWithTeam = await getUserWithTeam(user.id);
    // 如果用户没有关联团队，返回404错误
    if (!userWithTeam?.teamId) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // 解析请求体，获取活动类型和IP地址
    const { action, ipAddress } = await request.json();

    // 验证活动类型是否有效
    if (!action || !Object.values(ActivityType).includes(action as ActivityType)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      );
    }

    // 记录活动日志
    await logActivity(
      userWithTeam.teamId,
      user.id,
      action as ActivityType,
      ipAddress
    );

    // 返回成功响应
    return NextResponse.json({ success: true });
  } catch (error) {
    // 捕获并记录错误
    console.error('Error creating activity log:', error);
    // 返回500服务器错误
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}
