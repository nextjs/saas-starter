import { z } from 'zod';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

/**
 * 表单操作状态类型
 * 用于跟踪表单提交的状态和结果
 */
export type ActionState = {
  error?: string;        // 错误信息
  success?: string;      // 成功信息
  [key: string]: any;    // 允许添加其他属性
};

/**
 * 经过数据验证的操作函数类型
 * @template S - Zod验证模式
 * @template T - 操作返回值类型
 */
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,      // 经过验证的数据
  formData: FormData     // 原始表单数据
) => Promise<T>;

/**
 * 创建一个带数据验证的表单操作
 * 使用Zod验证表单数据，验证通过后执行操作
 *
 * @param schema - Zod验证模式
 * @param action - 验证通过后要执行的操作函数
 * @returns 包装后的操作函数
 */
export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    // 使用Zod验证表单数据
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      // 验证失败，返回错误信息
      return { error: result.error.errors[0].message } as T;
    }

    // 验证成功，执行操作
    return action(result.data, formData);
  };
}

/**
 * 带用户信息的验证操作函数类型
 * @template S - Zod验证模式
 * @template T - 操作返回值类型
 */
type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,      // 经过验证的数据
  formData: FormData,    // 原始表单数据
  user: User             // 当前用户信息
) => Promise<T>;

/**
 * 创建一个带数据验证和用户信息的表单操作
 * 验证用户登录状态和表单数据，然后执行操作
 *
 * @param schema - Zod验证模式
 * @param action - 验证通过后要执行的操作函数
 * @returns 包装后的操作函数
 */
export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    // 获取当前用户
    const user = await getUser();
    if (!user) {
      // 用户未登录，抛出错误
      throw new Error('User is not authenticated');
    }

    // 使用Zod验证表单数据
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      // 验证失败，返回错误信息
      return { error: result.error.errors[0].message } as T;
    }

    // 验证成功，执行操作并传入用户信息
    return action(result.data, formData, user);
  };
}

/**
 * 带团队信息的操作函数类型
 * @template T - 操作返回值类型
 */
type ActionWithTeamFunction<T> = (
  formData: FormData,           // 表单数据
  team: TeamDataWithMembers     // 团队信息（包含成员）
) => Promise<T>;

/**
 * 创建一个带团队信息的表单操作
 * 验证用户登录状态和团队信息，然后执行操作
 *
 * @param action - 要执行的操作函数
 * @returns 包装后的操作函数
 */
export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    // 获取当前用户
    const user = await getUser();
    if (!user) {
      // 用户未登录，重定向到登录页
      redirect('/sign-in');
    }

    // 获取用户所属团队
    const team = await getTeamForUser();
    if (!team) {
      // 团队不存在，抛出错误
      throw new Error('Team not found');
    }

    // 执行操作并传入团队信息
    return action(formData, team);
  };
}
