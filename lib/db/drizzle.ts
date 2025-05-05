import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

/**
 * 加载环境变量
 * 确保应用可以访问.env文件中定义的环境变量
 */
dotenv.config();

/**
 * 验证数据库连接URL是否存在
 * 如果环境变量未设置，则抛出错误
 */
if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL environment variable is not set');
}

/**
 * 处理数据库连接字符串
 * 确保URL以postgresql://开头(Supabase要求)
 * 有些环境可能提供postgres://格式的URL，需要转换
 */
const connectionString = process.env.POSTGRES_URL.replace(
  /^postgres:\/\//,
  'postgresql://'
);

/**
 * 创建PostgreSQL客户端连接
 * 使用postgres.js库建立与数据库的连接
 */
export const client = postgres(connectionString);

/**
 * 创建Drizzle ORM实例
 * 将PostgreSQL客户端与数据库模式结合，提供类型安全的数据库操作
 */
export const db = drizzle(client, { schema });
