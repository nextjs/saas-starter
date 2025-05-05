import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';

/**
 * 用于JWT签名和验证的密钥
 * 从环境变量AUTH_SECRET获取
 */
const key = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * 密码哈希的盐轮数
 * 用于bcrypt哈希算法的安全参数
 */
const SALT_ROUNDS = 10;

/**
 * 对密码进行哈希处理
 * 使用bcrypt算法将明文密码转换为安全的哈希值
 *
 * @param password - 需要哈希的明文密码
 * @returns 哈希后的密码
 */
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

/**
 * 比较明文密码和哈希密码是否匹配
 * 用于验证用户登录时输入的密码
 *
 * @param plainTextPassword - 用户输入的明文密码
 * @param hashedPassword - 数据库中存储的哈希密码
 * @returns 如果密码匹配返回true，否则返回false
 */
export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

/**
 * 会话数据类型
 * 定义JWT令牌中存储的用户会话信息
 */
type SessionData = {
  user: { id: number };  // 用户ID
  expires: string;       // 过期时间
};

/**
 * 签署JWT令牌
 * 创建包含用户会话信息的加密JWT令牌
 *
 * @param payload - 要包含在令牌中的会话数据
 * @returns 签名后的JWT令牌字符串
 */
export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })  // 使用HS256算法
    .setIssuedAt()                         // 设置签发时间
    .setExpirationTime('1 day from now')   // 设置过期时间为1天
    .sign(key);                            // 使用密钥签名
}

/**
 * 验证JWT令牌
 * 解析并验证JWT令牌的有效性
 *
 * @param input - JWT令牌字符串
 * @returns 解析后的会话数据
 */
export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],  // 指定使用HS256算法验证
  });
  return payload as SessionData;
}

/**
 * 获取当前用户会话
 * 从cookies中读取并验证会话令牌
 *
 * @returns 如果存在有效会话则返回会话数据，否则返回null
 */
export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

/**
 * 设置用户会话
 * 创建新的会话令牌并存储在cookies中
 *
 * @param user - 用户对象，包含用户ID
 */
export async function setSession(user: NewUser) {
  // 创建一天后的过期时间
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // 创建会话数据
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInOneDay.toISOString(),
  };

  // 签署会话令牌
  const encryptedSession = await signToken(session);

  // 设置会话cookie
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,  // cookie过期时间
    httpOnly: true,            // 仅服务器可访问，防止XSS攻击
    secure: true,              // 仅通过HTTPS发送
    sameSite: 'lax',           // 防止CSRF攻击
  });
}
