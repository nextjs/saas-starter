import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { outlets, TeamRole } from '@/lib/db/schema';
import { getKonteks } from '@/lib/laundry/queries';
import { LAYANAN_BAWAAN } from '@/lib/laundry/layanan-bawaan';
import { AksesDitolak } from '@/components/akses-ditolak';
import { MulaiClient } from './mulai-client';

export default async function MulaiPage() {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  // Sudah punya outlet berarti onboarding tidak relevan lagi.
  const sudahAda = await db
    .select({ id: outlets.id })
    .from(outlets)
    .where(eq(outlets.teamId, konteks.teamId))
    .limit(1);
  if (sudahAda.length > 0) redirect('/dashboard/pos');

  if (konteks.role !== TeamRole.OWNER) {
    return (
      <AksesDitolak
        role={konteks.role}
        keterangan="menyiapkan outlet pertama — minta Owner yang melakukannya"
      />
    );
  }

  return (
    <MulaiClient
      layanan={LAYANAN_BAWAAN.map((l) => ({
        kunci: l.kunci,
        nama: l.nama,
        tipe: l.tipe,
        satuan: l.satuan,
        hargaDefault: l.hargaDefault,
        disarankan: l.disarankan,
      }))}
    />
  );
}
