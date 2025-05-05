/**
 * Stripe支付集成模块
 * 提供与Stripe API交互的功能，包括结账、客户门户和订阅管理
 */
import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription,
  getPlanByStripeProductId
} from '@/lib/db/queries';
import { addSubscriptionCredits } from '@/lib/db/credits';

/**
 * Stripe实例
 * 使用环境变量中的密钥初始化Stripe客户端
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'  // 指定API版本
});

/**
 * 创建Stripe结账会话
 * 用于处理订阅付款流程
 *
 * @param team - 团队对象，可能为null
 * @param priceId - Stripe价格ID
 */
export async function createCheckoutSession({
  team,
  priceId
}: {
  team: Team | null;
  priceId: string;
}) {
  // 获取当前用户
  const user = await getUser();

  // 如果团队或用户不存在，重定向到注册页面
  if (!team || !user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // 创建Stripe结账会话
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],                // 支付方式：信用卡
    line_items: [                                  // 结账项目
      {
        price: priceId,                            // 价格ID
        quantity: 1                                // 数量
      }
    ],
    mode: 'subscription',                          // 模式：订阅
    // 成功URL，包含会话ID参数
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`, // 取消URL
    customer: team.stripeCustomerId || undefined,  // 客户ID（如果存在）
    client_reference_id: user.id.toString(),       // 客户端引用ID（用户ID）
    allow_promotion_codes: true,                   // 允许使用促销码
    subscription_data: {                           // 订阅数据
      trial_period_days: 14                        // 14天试用期
    }
  });

  // 重定向到Stripe结账页面
  redirect(session.url!);
}

/**
 * 创建Stripe客户门户会话
 * 允许用户管理其订阅、支付方式和账单信息
 *
 * @param team - 团队对象
 * @returns Stripe客户门户会话
 */
export async function createCustomerPortalSession(team: Team) {
  // 如果团队没有Stripe客户ID或产品ID，重定向到定价页面
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
  }

  // 声明配置变量
  let configuration: Stripe.BillingPortal.Configuration;
  // 获取现有的门户配置
  const configurations = await stripe.billingPortal.configurations.list();

  // 如果已有配置，使用第一个
  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    // 否则创建新配置

    // 获取团队的产品信息
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    // 获取产品的价格列表
    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    // 创建客户门户配置
    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'  // 门户标题
      },
      features: {
        // 订阅更新功能
        subscription_update: {
          enabled: true,                       // 启用更新
          default_allowed_updates: ['price', 'quantity', 'promotion_code'], // 允许更新的项目
          proration_behavior: 'create_prorations', // 按比例计费行为
          products: [
            {
              product: product.id,             // 产品ID
              prices: prices.data.map((price) => price.id) // 可用价格
            }
          ]
        },
        // 订阅取消功能
        subscription_cancel: {
          enabled: true,                       // 启用取消
          mode: 'at_period_end',               // 在结算周期结束时取消
          cancellation_reason: {
            enabled: true,                     // 启用取消原因
            options: [                         // 取消原因选项
              'too_expensive',                 // 太贵
              'missing_features',              // 缺少功能
              'switched_service',              // 切换服务
              'unused',                        // 未使用
              'other',                         // 其他
            ],
          },
        },
        // 支付方式更新功能
        payment_method_update: {
          enabled: true,                       // 启用支付方式更新
        },
      },
    });
  }

  // 创建客户门户会话
  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,           // 客户ID
    return_url: `${process.env.BASE_URL}/dashboard`, // 返回URL
    configuration: configuration.id            // 配置ID
  });
}

/**
 * 处理Stripe订阅变更
 * 当订阅状态变更时更新团队的订阅信息
 *
 * @param subscription - Stripe订阅对象
 */
export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  // 提取订阅信息
  const customerId = subscription.customer as string;  // 客户ID
  const subscriptionId = subscription.id;              // 订阅ID
  const status = subscription.status;                  // 订阅状态

  // 根据Stripe客户ID查找团队
  const team = await getTeamByStripeCustomerId(customerId);

  // 如果找不到团队，记录错误并返回
  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  // 处理活跃或试用状态
  if (status === 'active' || status === 'trialing') {
    // 获取计划信息
    const stripePlan = subscription.items.data[0]?.plan;
    const stripeProductId = stripePlan?.product as string;
    const planName = (stripePlan?.product as Stripe.Product).name;
    const interval = stripePlan?.interval || 'month';

    // 更新团队订阅信息
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,                // 更新订阅ID
      stripeProductId: stripeProductId,                    // 更新产品ID
      planName: planName,                                  // 更新计划名称
      subscriptionStatus: status                           // 更新订阅状态
    });

    // 查询数据库中的计划信息，获取积分数量
    const dbPlan = await getPlanByStripeProductId(stripeProductId);

    if (dbPlan) {
      // 添加订阅积分批次
      await addSubscriptionCredits(
        team.id,
        subscriptionId,
        stripeProductId,
        planName,
        dbPlan.creditsPerCycle,
        interval as 'month' | 'year'
      );
      console.log(`Added ${dbPlan.creditsPerCycle} credits for team ${team.id} (${planName} plan)`);
    } else {
      console.error(`Plan not found in database for Stripe product: ${stripeProductId}`);
    }
  }
  // 处理取消或未付款状态
  else if (status === 'canceled' || status === 'unpaid') {
    // 清除团队订阅信息
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,                          // 清除订阅ID
      stripeProductId: null,                               // 清除产品ID
      planName: null,                                      // 清除计划名称
      subscriptionStatus: status                           // 更新订阅状态
    });
  }
}

/**
 * 获取Stripe价格列表
 * 返回所有活跃的订阅价格
 *
 * @returns 格式化的价格列表
 */
export async function getStripePrices() {
  // 获取所有活跃的订阅价格
  const prices = await stripe.prices.list({
    expand: ['data.product'],    // 展开产品信息
    active: true,                // 只获取活跃价格
    type: 'recurring'            // 只获取订阅类型价格
  });

  // 格式化价格数据
  return prices.data.map((price) => ({
    id: price.id,                // 价格ID
    productId:                   // 产品ID
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,                   // 单价金额
    currency: price.currency,                        // 货币
    interval: price.recurring?.interval,             // 计费周期
    trialPeriodDays: price.recurring?.trial_period_days  // 试用期天数
  }));
}

/**
 * 获取Stripe产品列表
 * 返回所有活跃的产品
 *
 * @returns 格式化的产品列表
 */
export async function getStripeProducts() {
  // 获取所有活跃的产品
  const products = await stripe.products.list({
    active: true,                // 只获取活跃产品
    expand: ['data.default_price']  // 展开默认价格信息
  });

  // 格式化产品数据
  return products.data.map((product) => ({
    id: product.id,              // 产品ID
    name: product.name,          // 产品名称
    description: product.description,  // 产品描述
    defaultPriceId:              // 默认价格ID
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}
