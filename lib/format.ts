/**
 * Format tampilan Indonesia. Waktu disimpan UTC di database dan selalu
 * ditampilkan sebagai WIB, apa pun timezone browser/server yang menjalankan.
 */

const TZ = 'Asia/Jakarta';

/** `42000` → `"Rp 42.000"`. Rupiah tidak pakai desimal. */
export function rupiah(nilai: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(nilai)
    // Intl menghasilkan "Rp42.000" (tanpa spasi); standar tulis kita "Rp 42.000".
    .replace(/^Rp\s?/, 'Rp ');
}

/** `42000` → `"42.000"` — untuk input dan kolom tabel yang sudah berjudul Rupiah. */
export function angka(nilai: number): string {
  return new Intl.NumberFormat('id-ID').format(nilai);
}

/** Buang semua non-digit: `"Rp 42.000"` → `42000`. Untuk input uang. */
export function parseRupiah(teks: string): number {
  const bersih = teks.replace(/\D/g, '');
  return bersih === '' ? 0 : parseInt(bersih, 10);
}

/** `"3.50"` → `"3,5 kg"` — buang nol di belakang, koma sebagai desimal. */
export function kuantitas(qty: number | string, satuan: string): string {
  const n = typeof qty === 'string' ? parseFloat(qty) : qty;
  const teks = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 2,
  }).format(n);
  return `${teks} ${satuan}`;
}

/** `"25 Agu 2026"` */
export function tanggal(d: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: TZ,
  }).format(new Date(d));
}

/** `"25 Agu 2026, 14.30"` */
export function tanggalJam(d: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  }).format(new Date(d));
}

/** `"14.30"` */
export function jam(d: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TZ,
  }).format(new Date(d));
}

/**
 * Bagian tanggal WIB sebagai `YYMMDD` — dipakai untuk nomor nota.
 * Harus WIB, bukan UTC: order jam 00:30 WIB masih 17:30 UTC hari sebelumnya,
 * dan kasir mengharapkan nomornya ikut tanggal hari ini menurut jam dinding.
 */
export function kodeTanggalWIB(d: Date = new Date()): string {
  const bagian = new Intl.DateTimeFormat('en-CA', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    timeZone: TZ,
  }).format(d); // en-CA → "26-08-25"
  return bagian.replace(/-/g, '');
}
