/**
 * 数据库种子文件
 * 用于初始化数据库，创建初始用户、团队和Stripe产品
 */
import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';

/**
 * 创建Stripe产品和价格
 * 初始化两个订阅计划：Base和Plus
 */
async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  // 创建Base产品
  const baseProduct = await stripe.products.create({
    name: 'Base',                         // 产品名称
    description: 'Base subscription plan', // 产品描述
  });

  // 为Base产品创建价格
  await stripe.prices.create({
    product: baseProduct.id,              // 关联产品ID
    unit_amount: 800,                     // $8（以美分为单位）
    currency: 'usd',                      // 货币单位
    recurring: {                          // 订阅设置
      interval: 'month',                  // 按月计费
      trial_period_days: 7,               // 7天试用期
    },
  });

  // 创建Plus产品
  const plusProduct = await stripe.products.create({
    name: 'Plus',                         // 产品名称
    description: 'Plus subscription plan', // 产品描述
  });

  // 为Plus产品创建价格
  await stripe.prices.create({
    product: plusProduct.id,              // 关联产品ID
    unit_amount: 1200,                    // $12（以美分为单位）
    currency: 'usd',                      // 货币单位
    recurring: {                          // 订阅设置
      interval: 'month',                  // 按月计费
      trial_period_days: 7,               // 7天试用期
    },
  });

  console.log('Stripe products and prices created successfully.');
}

/**
 * 数据库种子函数
 * 创建初始用户、团队，并设置Stripe产品
 */
async function seed() {
  // 设置初始用户凭据
  const email = 'we@love2.dev';
  const password = 'love2dev';
  const passwordHash = await hashPassword(password);

  // 创建初始用户
  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",                    // 设置为所有者角色
      },
    ])
    .returning();

  console.log('Initial user created.');

  // 创建初始团队
  const [team] = await db
    .insert(teams)
    .values({
      name: 'Love2.dev',                  // 团队名称
    })
    .returning();

  // 将用户添加到团队
  await db.insert(teamMembers).values({
    teamId: team.id,                      // 团队ID
    userId: user.id,                      // 用户ID
    role: 'owner',                        // 团队角色
  });

  // 创建Stripe产品和价格
  await createStripeProducts();
}

// 执行种子函数
seed()
  .catch((error) => {
    // 处理错误
    console.error('Seed process failed:', error);
    process.exit(1);                      // 失败时退出，状态码为1
  })
  .finally(() => {
    // 完成后的清理工作
    console.log('Seed process finished. Exiting...');
    process.exit(0);                      // 成功时退出，状态码为0
  });
