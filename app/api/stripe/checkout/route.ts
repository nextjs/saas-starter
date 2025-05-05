import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { setSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';

/**
 * 处理Stripe结账成功后的回调
 * 当用户完成Stripe支付流程后，Stripe会重定向到此端点
 * 此API负责更新用户的订阅信息并将用户重定向到仪表板
 */
export async function GET(request: NextRequest) {
  // 从URL查询参数中获取Stripe会话ID
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  // 如果没有会话ID，重定向到定价页面
  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    // 从Stripe获取结账会话详情，包括客户和订阅信息
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    // 验证客户数据有效性
    if (!session.customer || typeof session.customer === 'string') {
      throw new Error('Invalid customer data from Stripe.');
    }

    // 提取客户ID
    const customerId = session.customer.id;
    // 提取订阅ID，处理可能的字符串或对象格式
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    // 确保存在订阅ID
    if (!subscriptionId) {
      throw new Error('No subscription found for this session.');
    }

    // 获取订阅详情，包括价格和产品信息
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    // 获取订阅计划价格
    const plan = subscription.items.data[0]?.price;

    // 确保存在计划
    if (!plan) {
      throw new Error('No plan found for this subscription.');
    }

    // 获取产品ID
    const productId = (plan.product as Stripe.Product).id;

    // 确保存在产品ID
    if (!productId) {
      throw new Error('No product ID found for this subscription.');
    }

    // 从会话中获取用户ID
    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    // 从数据库获取用户信息
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);

    // 确保用户存在
    if (user.length === 0) {
      throw new Error('User not found in database.');
    }

    // 获取用户所属的团队
    const userTeam = await db
      .select({
        teamId: teamMembers.teamId,
      })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user[0].id))
      .limit(1);

    // 确保用户属于某个团队
    if (userTeam.length === 0) {
      throw new Error('User is not associated with any team.');
    }

    // 更新团队的订阅信息
    await db
      .update(teams)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        stripeProductId: productId,
        planName: (plan.product as Stripe.Product).name,
        subscriptionStatus: subscription.status,
        updatedAt: new Date(),
      })
      .where(eq(teams.id, userTeam[0].teamId));

    // 设置用户会话
    await setSession(user[0]);
    // 重定向到仪表板
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    // 记录错误并重定向到错误页面
    console.error('Error handling successful checkout:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
