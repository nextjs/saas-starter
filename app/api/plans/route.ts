import { getPlans } from '@/lib/db/queries';

/**
 * 获取所有可用的订阅计划
 * 此API端点返回系统中所有可用的订阅计划信息
 */
export async function GET() {
  // 从数据库获取所有计划信息
  const plans = await getPlans();
  // 以JSON格式返回计划数据
  return Response.json(plans);
}