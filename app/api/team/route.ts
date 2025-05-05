import { getTeamForUser } from '@/lib/db/queries';

/**
 * 获取当前登录用户所属的团队信息
 * 此API端点返回当前用户关联的团队数据
 */
export async function GET() {
  // 从数据库获取当前用户的团队信息
  const team = await getTeamForUser();
  // 以JSON格式返回团队数据
  return Response.json(team);
}
