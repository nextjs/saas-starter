'use server';

import { and, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { invitations, teams, users } from '@/lib/db/schema';
import { JenisEmail, StatusEmail, TeamRole } from '@/lib/laundry/enums';
import { getKonteks } from '@/lib/laundry/queries';
import { emailUndangan, kirimDanCatat } from '@/lib/email/kirim';

export type HasilAksi = { error?: string; success?: string };

export type UndanganTertunda = {
  id: number;
  email: string;
  role: string;
  invitedAt: string;
  olehNama: string | null;
  olehEmail: string;
};

export async function getUndanganTertunda(
  teamId: number
): Promise<UndanganTertunda[]> {
  const baris = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      invitedAt: invitations.invitedAt,
      olehNama: users.name,
      olehEmail: users.email,
    })
    .from(invitations)
    .innerJoin(users, eq(invitations.invitedBy, users.id))
    .where(and(eq(invitations.teamId, teamId), eq(invitations.status, 'pending')))
    .orderBy(desc(invitations.invitedAt));

  return baris.map((b) => ({ ...b, invitedAt: b.invitedAt.toISOString() }));
}

async function ambilUndanganMilikTenant(id: number, teamId: number) {
  const [u] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.id, id),
        eq(invitations.teamId, teamId),
        eq(invitations.status, 'pending')
      )
    )
    .limit(1);
  return u ?? null;
}

export async function kirimUlangUndangan(id: number): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (konteks.role !== TeamRole.OWNER) {
    return { error: 'Hanya Owner yang boleh mengelola undangan.' };
  }

  const undangan = await ambilUndanganMilikTenant(id, konteks.teamId);
  if (!undangan) return { error: 'Undangan tidak ditemukan atau sudah tidak tertunda.' };

  const [tim] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, konteks.teamId))
    .limit(1);

  const { subjek, isi } = emailUndangan({
    namaTim: tim?.name ?? 'tim Anda',
    namaPengundang: konteks.user.name || konteks.user.email,
    peran: undangan.role,
    inviteId: undangan.id,
    email: undangan.email,
  });

  const hasil = await kirimDanCatat({
    teamId: konteks.teamId,
    jenis: JenisEmail.UNDANGAN,
    tujuan: undangan.email,
    subjek,
    isi,
  });

  revalidatePath('/dashboard');

  if (hasil.status === StatusEmail.GAGAL) {
    return { error: `Gagal mengirim: ${hasil.galat ?? 'penyebab tidak diketahui'}` };
  }
  if (hasil.status === StatusEmail.SIMULASI) {
    return {
      success:
        'Email berjalan dalam mode simulasi — isinya tercatat di log, tapi belum benar-benar dikirim.',
    };
  }
  return { success: `Undangan dikirim ulang ke ${undangan.email}.` };
}

/**
 * Membatalkan undangan.
 *
 * Penting karena undangan tertunda ikut memakan kuota pengguna (Fase 3 §5) —
 * tanpa tombol ini, kuota bisa tersandera undangan yang salah ketik.
 */
export async function batalkanUndangan(id: number): Promise<HasilAksi> {
  const konteks = await getKonteks();
  if (!konteks) return { error: 'Sesi tidak valid.' };
  if (konteks.role !== TeamRole.OWNER) {
    return { error: 'Hanya Owner yang boleh mengelola undangan.' };
  }

  const hasil = await db
    .update(invitations)
    .set({ status: 'cancelled' })
    .where(
      and(
        eq(invitations.id, id),
        eq(invitations.teamId, konteks.teamId),
        eq(invitations.status, 'pending')
      )
    )
    .returning({ id: invitations.id });

  if (hasil.length === 0) {
    return { error: 'Undangan tidak ditemukan atau sudah tidak tertunda.' };
  }

  revalidatePath('/dashboard');
  return { success: 'Undangan dibatalkan. Kuota penggunanya kembali tersedia.' };
}
