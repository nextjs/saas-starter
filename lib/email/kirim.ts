import 'server-only';

import { db } from '@/lib/db/drizzle';
import { emailLog } from '@/lib/db/schema';
import { JenisEmail, StatusEmail } from '@/lib/laundry/enums';
import { kirimEmail, pengirimAktif } from './provider';

export function baseUrl(): string {
  return process.env.BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
}

/**
 * Menyamarkan token di dalam tautan sebelum isi email disimpan ke log.
 *
 * Log email berguna untuk menelusuri "kenapa emailku tidak sampai", tapi kalau
 * tokennya ikut tersimpan utuh, tabel itu berubah jadi daftar kunci cadangan
 * untuk setiap akun — siapa pun yang bisa membaca database bisa mengambil alih
 * akun mana pun tanpa perlu tahu passwordnya.
 */
export function samarkanToken(isi: string): string {
  return isi.replace(
    /(reset-password\/)[A-Za-z0-9_-]+/g,
    '$1<token-disamarkan>'
  );
}

type OpsiKirim = {
  teamId?: number;
  jenis: JenisEmail;
  tujuan: string;
  subjek: string;
  isi: string;
};

export type HasilEmail = {
  status: StatusEmail;
  galat?: string;
};

/**
 * Kirim satu email dan catat jejaknya.
 *
 * Selalu mengembalikan hasil, tidak pernah melempar: pemanggilnya (undangan,
 * reset password) tidak boleh ikut gagal hanya karena penyedia email sedang
 * bermasalah — barisnya sudah tersimpan dan bisa dikirim ulang.
 */
export async function kirimDanCatat(opsi: OpsiKirim): Promise<HasilEmail> {
  try {
    const hasil = await kirimEmail(opsi.tujuan, opsi.subjek, opsi.isi);

    const status = hasil.simulasi
      ? StatusEmail.SIMULASI
      : hasil.terkirim
        ? StatusEmail.TERKIRIM
        : StatusEmail.GAGAL;

    await db.insert(emailLog).values({
      teamId: opsi.teamId ?? null,
      jenis: opsi.jenis,
      tujuan: opsi.tujuan,
      subjek: opsi.subjek,
      isi: samarkanToken(opsi.isi),
      status,
      provider: pengirimAktif(),
      galat: hasil.galat || null,
    });

    return { status, galat: hasil.galat };
  } catch (error: any) {
    console.error('Gagal memproses email:', error);
    return { status: StatusEmail.GAGAL, galat: error?.message ?? 'Kesalahan tak terduga' };
  }
}

export function emailUndangan(opsi: {
  namaTim: string;
  namaPengundang: string;
  peran: string;
  inviteId: number;
  email: string;
}): { subjek: string; isi: string } {
  const tautan = `${baseUrl()}/sign-up?inviteId=${opsi.inviteId}&email=${encodeURIComponent(opsi.email)}`;

  return {
    subjek: `Undangan bergabung ke ${opsi.namaTim} di LaundryKu`,
    isi: `Halo,

${opsi.namaPengundang} mengundang Anda bergabung ke ${opsi.namaTim} di LaundryKu sebagai ${opsi.peran}.

Buat akun Anda lewat tautan berikut:
${tautan}

Gunakan alamat email ini (${opsi.email}) saat mendaftar, supaya undangannya cocok.

Kalau Anda merasa tidak mengenal pengirimnya, abaikan saja email ini.

— LaundryKu`,
  };
}

export function emailResetPassword(opsi: {
  token: string;
  menitBerlaku: number;
}): { subjek: string; isi: string } {
  const tautan = `${baseUrl()}/reset-password/${opsi.token}`;

  return {
    subjek: 'Atur ulang password LaundryKu Anda',
    isi: `Halo,

Kami menerima permintaan untuk mengatur ulang password akun LaundryKu Anda.

Buka tautan berikut untuk membuat password baru:
${tautan}

Tautan ini hanya berlaku ${opsi.menitBerlaku} menit dan hanya bisa dipakai satu kali.

Kalau Anda tidak merasa meminta ini, abaikan saja email ini — password Anda tidak berubah.

— LaundryKu`,
  };
}
