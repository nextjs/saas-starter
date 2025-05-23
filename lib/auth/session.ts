import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NewUser } from '@/lib/db/schema';

const SALT_ROUNDS = 10;

// These functions can be used by both client and server components
export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export type SessionData = {
  user: { id: string };
  expires: string;
};

// Functions for JWT handling, can be used in both client and server
export async function signToken(payload: SessionData) {
  const key = new TextEncoder().encode(process.env.AUTH_SECRET);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const key = new TextEncoder().encode(process.env.AUTH_SECRET);
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
} 