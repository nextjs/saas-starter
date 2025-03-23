import { compare, hash } from 'bcryptjs';
import { createClient } from '@/utils/supabase/server';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function verifyToken(token: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return {
    user: { id: data.user.id },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
