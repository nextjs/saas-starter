'use server';

import { and, eq, gt, isNull, sql } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { emailLog, passwordResetTokens, users } from '@/lib/db/schema';
import {
  JenisEmail,
  MAKS_PERMINTAAN_RESET,
  MENIT_TOKEN_RESET,
  StatusEmail,
} from '@/lib/laundry/enums';
import { hashPassword } from './session';
import { emailResetPassword, kirimDanCatat } from '@/lib/email/kirim';

export type HasilAksi = { error?: string; success?: string };

/**
 * Balasan yang SELALU sama, terdaftar atau tidak.
 *
 * Kalau balasannya berbeda untuk email yang ada dan tidak ada, halaman ini
 * berubah jadi alat memeriksa siapa saja yang punya akun di sini.
 */
const BALASAN_NETRAL =
  'Kalau email itu terdaftar, kami sudah mengirim tautan untuk mengatur ulang password. Cek kotak masuk dan folder spam.';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

const mintaSchema = z.object({
  email: z.string().email('Alamat email tidak valid').max(255),
});

export async function mintaResetPassword(
  input: z.infer<typeof mintaSchema>
): Promise<HasilAksi> {
  const parsed = mintaSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const email = parsed.data.email.toLowerCase().trim();

  // Batasi laju sebelum menyentuh apa pun. Tanpa ini, halaman ini bisa dipakai
  // membanjiri kotak masuk orang lain.
  const sejam = new Date(Date.now() - 60 * 60 * 1000);
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)` })
    .from(emailLog)
    .where(
      and(
        eq(emailLog.tujuan, email),
        eq(emailLog.jenis, JenisEmail.RESET_PASSWORD),
        gt(emailLog.createdAt, sejam)
      )
    );

  if (Number(n) >= MAKS_PERMINTAAN_RESET) {
    // Tetap balasan netral: memberi tahu "terlalu sering" pun membocorkan
    // bahwa email ini pernah diminta reset.
    return { success: BALASAN_NETRAL };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), isNull(users.deletedAt)))
    .limit(1);

  if (!user) return { success: BALASAN_NETRAL };

  const token = randomBytes(32).toString('base64url');

  await db.transaction(async (tx) => {
    // Batalkan token lama supaya tidak ada dua kunci berlaku bersamaan.
    await tx
      .update(passwordResetTokens)
      .set({ dipakaiPada: new Date() })
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.dipakaiPada)
        )
      );

    await tx.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashToken(token),
      kedaluwarsaPada: new Date(Date.now() + MENIT_TOKEN_RESET * 60 * 1000),
    });
  });

  const { subjek, isi } = emailResetPassword({
    token,
    menitBerlaku: MENIT_TOKEN_RESET,
  });

  await kirimDanCatat({
    jenis: JenisEmail.RESET_PASSWORD,
    tujuan: email,
    subjek,
    isi,
  });

  return { success: BALASAN_NETRAL };
}

/** Apakah token masih bisa ditukar? Dipakai halaman reset sebelum menampilkan form. */
export async function tokenResetValid(token: string): Promise<boolean> {
  if (!token) return false;

  const [baris] = await db
    .select({ id: passwordResetTokens.id })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.dipakaiPada),
        gt(passwordResetTokens.kedaluwarsaPada, new Date())
      )
    )
    .limit(1);

  return Boolean(baris);
}

const gantiSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, 'Password minimal 8 karakter').max(100),
  konfirmasi: z.string(),
});

export async function gantiPasswordDenganToken(
  input: z.infer<typeof gantiSchema>
): Promise<HasilAksi> {
  const parsed = gantiSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  const { token, password, konfirmasi } = parsed.data;

  if (password !== konfirmasi) {
    return { error: 'Konfirmasi password tidak cocok.' };
  }

  const [baris] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.dipakaiPada),
        gt(passwordResetTokens.kedaluwarsaPada, new Date())
      )
    )
    .limit(1);

  if (!baris) {
    return {
      error:
        'Tautan ini sudah tidak berlaku — mungkin kedaluwarsa atau sudah dipakai. Minta tautan baru.',
    };
  }

  const passwordHash = await hashPassword(password);
  const sekarang = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ passwordHash, updatedAt: sekarang })
      .where(eq(users.id, baris.userId));

    // Tandai terpakai di dalam transaksi yang sama: kalau penggantian password
    // berhasil tapi penandaan gagal, token yang sama masih bisa dipakai lagi.
    await tx
      .update(passwordResetTokens)
      .set({ dipakaiPada: sekarang })
      .where(eq(passwordResetTokens.id, baris.id));
  });

  return { success: 'Password berhasil diganti. Silakan masuk dengan password baru.' };
}
