import { getUser } from '@/lib/db/queries';

/**
 * 获取当前登录用户的信息
 * 此API端点返回当前认证用户的详细信息
 */
export async function GET() {
  // 从数据库获取当前用户信息
  const user = await getUser();
  // 以JSON格式返回用户数据
  return Response.json(user);
}
