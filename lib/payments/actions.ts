/**
 * Stripe支付相关的服务器操作
 * 包含结账和客户门户的服务器操作函数
 */
'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';

/**
 * 结账操作
 * 创建Stripe结账会话，用于处理订阅付款
 *
 * 使用withTeam中间件确保用户已登录并关联到团队
 */
export const checkoutAction = withTeam(async (formData, team) => {
  // 从表单数据中获取价格ID
  const priceId = formData.get('priceId') as string;
  // 创建结账会话
  await createCheckoutSession({ team: team, priceId });
});

/**
 * 客户门户操作
 * 创建Stripe客户门户会话，用于管理订阅
 *
 * 使用withTeam中间件确保用户已登录并关联到团队
 */
export const customerPortalAction = withTeam(async (_, team) => {
  // 创建客户门户会话
  const portalSession = await createCustomerPortalSession(team);
  // 重定向到Stripe客户门户
  redirect(portalSession.url);
});
