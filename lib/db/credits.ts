/**
 * 积分管理模块
 * 提供积分批次创建、使用和过期处理的功能
 */
import { db } from './drizzle';
import {
  creditBatches,
  creditTransactions,
  CreditSourceType,
  CreditTransactionType,
  NewCreditBatch,
  NewCreditTransaction
} from './schema';
import { addMonths, addYears } from 'date-fns';
import { and, eq } from 'drizzle-orm';

/**
 * 为团队添加免费计划积分批次
 *
 * @param teamId 团队ID
 * @returns 创建的积分批次ID
 */
export async function addFreeCredits(teamId: number) {
  // 使用事务确保数据一致性
  return await db.transaction(async (tx) => {
    // 设置积分到期时间为一个月后
    const expiresAt = addMonths(new Date(), 1);

    // 创建积分批次
    const newBatch: NewCreditBatch = {
      teamId,
      initialAmount: 100, // 免费计划每月100积分
      remainingAmount: 100,
      source: CreditSourceType.FREE_PLAN,
      sourceRefId: null,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 插入积分批次记录
    const [creditBatch] = await tx
      .insert(creditBatches)
      .values(newBatch)
      .returning();

    if (!creditBatch) {
      throw new Error('Failed to create credit batch');
    }

    // 创建积分交易记录
    const transaction: NewCreditTransaction = {
      teamId,
      batchId: creditBatch.id,
      amount: 100,
      description: '免费计划月度积分',
      type: CreditTransactionType.GRANT,
      metadata: { plan: 'free' },
      createdAt: new Date()
    };

    // 插入积分交易记录
    await tx
      .insert(creditTransactions)
      .values(transaction);

    return creditBatch.id;
  });
}

/**
 * 为团队添加订阅计划积分批次
 *
 * @param teamId 团队ID
 * @param subscriptionId Stripe订阅ID
 * @param productId Stripe产品ID
 * @param planName 计划名称
 * @param creditsAmount 积分数量
 * @param interval 订阅周期（month或year）
 * @returns 创建的积分批次ID
 */
export async function addSubscriptionCredits(
  teamId: number,
  subscriptionId: string,
  productId: string,
  planName: string,
  creditsAmount: number,
  interval: 'month' | 'year' = 'month'
) {
  // 使用事务确保数据一致性
  return await db.transaction(async (tx) => {
    // 根据订阅周期设置积分到期时间
    const expiresAt = interval === 'month'
      ? addMonths(new Date(), 1)
      : addYears(new Date(), 1);

    // 创建积分批次
    const newBatch: NewCreditBatch = {
      teamId,
      initialAmount: creditsAmount,
      remainingAmount: creditsAmount,
      source: CreditSourceType.SUBSCRIPTION,
      sourceRefId: subscriptionId,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 插入积分批次记录
    const [creditBatch] = await tx
      .insert(creditBatches)
      .values(newBatch)
      .returning();

    if (!creditBatch) {
      throw new Error('Failed to create credit batch');
    }

    // 创建积分交易记录
    const transaction: NewCreditTransaction = {
      teamId,
      batchId: creditBatch.id,
      amount: creditsAmount,
      description: `订阅计划积分：${planName}`,
      type: CreditTransactionType.GRANT,
      metadata: {
        subscriptionId,
        productId,
        planName
      },
      createdAt: new Date()
    };

    // 插入积分交易记录
    await tx
      .insert(creditTransactions)
      .values(transaction);

    return creditBatch.id;
  });
}

/**
 * 处理积分批次过期
 * 将过期的积分批次的剩余额度设为0，并创建过期交易记录
 *
 * @param batchId 积分批次ID
 * @returns 处理结果
 */
export async function expireCreditBatch(batchId: number) {
  // 使用事务确保数据一致性
  return await db.transaction(async (tx) => {
    // 获取积分批次信息
    const [batch] = await tx
      .select()
      .from(creditBatches)
      .where(and(
        eq(creditBatches.id, batchId),
        eq(creditBatches.remainingAmount, 0)
      ))
      .limit(1);

    if (!batch) {
      throw new Error('Credit batch not found or already expired');
    }

    // 计算过期的积分数量
    const expiredAmount = batch.remainingAmount;

    if (expiredAmount <= 0) {
      return { expired: false, amount: 0 };
    }

    // 更新积分批次，将剩余额度设为0
    await tx
      .update(creditBatches)
      .set({
        remainingAmount: 0,
        updatedAt: new Date()
      })
      .where(eq(creditBatches.id, batchId));

    // 创建过期交易记录
    const transaction: NewCreditTransaction = {
      teamId: batch.teamId,
      batchId: batch.id,
      amount: expiredAmount,
      description: '积分过期',
      type: CreditTransactionType.EXPIRE,
      metadata: {
        expiredAt: new Date().toISOString()
      },
      createdAt: new Date()
    };

    // 插入积分交易记录
    await tx
      .insert(creditTransactions)
      .values(transaction);

    return { expired: true, amount: expiredAmount };
  });
}
