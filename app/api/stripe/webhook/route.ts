import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Stripe Webhook密钥
 * 用于验证来自Stripe的webhook请求的合法性
 */
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * 处理来自Stripe的webhook事件
 * 主要处理订阅相关的事件，如订阅更新和删除
 */
export async function POST(request: NextRequest) {
  // 获取请求体原始数据
  const payload = await request.text();
  // 获取Stripe签名，用于验证请求的真实性
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // 使用Stripe SDK验证webhook事件
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    // 如果验证失败，记录错误并返回400状态码
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  // 根据事件类型处理不同的webhook事件
  switch (event.type) {
    case 'customer.subscription.updated': // 订阅更新事件
    case 'customer.subscription.deleted': // 订阅删除事件
      const subscription = event.data.object as Stripe.Subscription;
      // 处理订阅变更
      await handleSubscriptionChange(subscription);
      break;
    default:
      // 记录未处理的事件类型
      console.log(`Unhandled event type ${event.type}`);
  }

  // 返回成功响应，通知Stripe已接收事件
  return NextResponse.json({ received: true });
}
