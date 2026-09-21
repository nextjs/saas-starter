import 'server-only';

/**
 * Adapter pengiriman WhatsApp.
 *
 * Kredensial dibaca dari environment, tidak pernah dari database — token adalah
 * rahasia, dan menaruhnya di tabel berarti setiap backup ikut membawanya.
 * Konsekuensinya satu nomor pengirim untuk seluruh platform; WA per-tenant
 * masuk Fase 3 (lihat PRD-FASE-2.md §1).
 *
 * Tanpa kredensial, adapter jatuh ke mode `simulasi`: pesan tetap dirender dan
 * dicatat di tabel `notifications`, tapi tidak dikirim ke siapa pun. Ini yang
 * membuat fitur bisa dikembangkan dan didemokan tanpa biaya dan tanpa
 * mengganggu nomor orang sungguhan.
 *
 * Env yang dipakai:
 *   WA_PROVIDER = fonnte | wablas | simulasi   (default: simulasi)
 *   WA_TOKEN    = token dari provider
 *   WA_BASE_URL = opsional, override endpoint (dipakai saat testing)
 */

export type NamaProvider = 'fonnte' | 'wablas' | 'simulasi';

export type HasilKirim = {
  terkirim: boolean;
  simulasi: boolean;
  referensi?: string;
  galat?: string;
};

export function providerAktif(): NamaProvider {
  const p = (process.env.WA_PROVIDER ?? '').toLowerCase();
  if (p === 'fonnte' || p === 'wablas') {
    // Provider disebut tapi tokennya kosong: lebih baik jatuh ke simulasi
    // daripada gagal terus-menerus di setiap perubahan status.
    return process.env.WA_TOKEN ? p : 'simulasi';
  }
  return 'simulasi';
}

/**
 * Normalisasi nomor Indonesia ke format internasional tanpa tanda plus:
 *   "0812-3456-7890" → "6281234567890"
 *   "+62 812 3456"   → "62812345 6"  (spasi & tanda baca dibuang)
 *   "62812..."       → tetap
 *
 * Provider WA menolak nomor berawalan 0, dan kasir hampir selalu mengetik 0.
 */
export function normalkanNomor(nomor: string): string {
  let bersih = nomor.replace(/\D/g, '');
  if (bersih.startsWith('0')) bersih = '62' + bersih.slice(1);
  else if (bersih.startsWith('8')) bersih = '62' + bersih;
  return bersih;
}

/** Nomor Indonesia yang masuk akal: 62 + 9..13 digit. */
export function nomorValid(nomor: string): boolean {
  return /^62\d{8,13}$/.test(normalkanNomor(nomor));
}

async function kirimFonnte(tujuan: string, pesan: string): Promise<HasilKirim> {
  const url = process.env.WA_BASE_URL ?? 'https://api.fonnte.com/send';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: process.env.WA_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target: tujuan, message: pesan }),
  });

  const data = await res.json().catch(() => ({}) as any);
  if (!res.ok || data?.status === false) {
    return {
      terkirim: false,
      simulasi: false,
      galat: data?.reason ?? `HTTP ${res.status}`,
    };
  }
  return {
    terkirim: true,
    simulasi: false,
    referensi: Array.isArray(data?.id) ? data.id.join(',') : String(data?.id ?? ''),
  };
}

async function kirimWablas(tujuan: string, pesan: string): Promise<HasilKirim> {
  const url = process.env.WA_BASE_URL ?? 'https://console.wablas.com/api/send-message';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: process.env.WA_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone: tujuan, message: pesan }),
  });

  const data = await res.json().catch(() => ({}) as any);
  if (!res.ok || data?.status === false) {
    return {
      terkirim: false,
      simulasi: false,
      galat: data?.message ?? `HTTP ${res.status}`,
    };
  }
  return {
    terkirim: true,
    simulasi: false,
    referensi: String(data?.data?.messages?.[0]?.id ?? ''),
  };
}

/**
 * Mengirim satu pesan. Tidak pernah melempar exception — kegagalan dikembalikan
 * sebagai nilai, karena pemanggilnya (perubahan status pesanan) tidak boleh
 * ikut gagal hanya karena WhatsApp sedang bermasalah.
 */
export async function kirimWa(tujuan: string, pesan: string): Promise<HasilKirim> {
  const nomor = normalkanNomor(tujuan);
  const provider = providerAktif();

  if (!nomorValid(nomor)) {
    return { terkirim: false, simulasi: false, galat: 'Nomor tidak valid' };
  }

  if (provider === 'simulasi') {
    return { terkirim: false, simulasi: true };
  }

  try {
    return provider === 'fonnte'
      ? await kirimFonnte(nomor, pesan)
      : await kirimWablas(nomor, pesan);
  } catch (error: any) {
    return {
      terkirim: false,
      simulasi: false,
      galat: error?.message ?? 'Gagal menghubungi provider',
    };
  }
}
