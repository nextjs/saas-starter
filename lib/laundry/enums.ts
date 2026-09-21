/**
 * Enum & label domain laundry — modul murni tanpa import drizzle.
 *
 * Dipisah dari `lib/db/schema.ts` supaya komponen client (POS, filter status)
 * bisa memakai konstanta ini tanpa ikut menarik driver Postgres ke bundle browser.
 * `schema.ts` me-re-export file ini, jadi import lama tetap jalan.
 */

export enum TeamRole {
  OWNER = 'OWNER',
  MANAJER = 'MANAJER',
  KASIR = 'KASIR',
  PRODUKSI = 'PRODUKSI',
}

export enum ServiceType {
  KILOAN = 'KILOAN',
  SATUAN = 'SATUAN',
}

export enum OrderStatus {
  BARU = 'BARU',
  PROSES_CUCI = 'PROSES_CUCI',
  PROSES_KERING = 'PROSES_KERING',
  PROSES_SETRIKA = 'PROSES_SETRIKA',
  SIAP_AMBIL = 'SIAP_AMBIL',
  SELESAI = 'SELESAI',
  BATAL = 'BATAL',
}

export enum PaymentStatus {
  BELUM_BAYAR = 'BELUM_BAYAR',
  DP = 'DP',
  LUNAS = 'LUNAS',
}

export enum PaymentMethod {
  TUNAI = 'TUNAI',
  TRANSFER = 'TRANSFER',
  QRIS = 'QRIS',
  EWALLET = 'EWALLET',
}

/** Urutan normal produksi. BATAL sengaja di luar alur — bisa dari mana saja. */
export const ALUR_STATUS: OrderStatus[] = [
  OrderStatus.BARU,
  OrderStatus.PROSES_CUCI,
  OrderStatus.PROSES_KERING,
  OrderStatus.PROSES_SETRIKA,
  OrderStatus.SIAP_AMBIL,
  OrderStatus.SELESAI,
];

export const LABEL_STATUS: Record<OrderStatus, string> = {
  [OrderStatus.BARU]: 'Baru / Antrian',
  [OrderStatus.PROSES_CUCI]: 'Proses Cuci',
  [OrderStatus.PROSES_KERING]: 'Proses Kering',
  [OrderStatus.PROSES_SETRIKA]: 'Proses Setrika',
  [OrderStatus.SIAP_AMBIL]: 'Siap Diambil',
  [OrderStatus.SELESAI]: 'Selesai / Diambil',
  [OrderStatus.BATAL]: 'Batal',
};

/** Warna badge status — dipasangkan light/dark agar kontras tetap lolos WCAG AA. */
export const WARNA_STATUS: Record<OrderStatus, string> = {
  [OrderStatus.BARU]:
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  [OrderStatus.PROSES_CUCI]:
    'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
  [OrderStatus.PROSES_KERING]:
    'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-100',
  [OrderStatus.PROSES_SETRIKA]:
    'bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100',
  [OrderStatus.SIAP_AMBIL]:
    'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
  [OrderStatus.SELESAI]:
    'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100',
  [OrderStatus.BATAL]:
    'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
};

export const LABEL_STATUS_BAYAR: Record<PaymentStatus, string> = {
  [PaymentStatus.BELUM_BAYAR]: 'Belum Bayar',
  [PaymentStatus.DP]: 'DP',
  [PaymentStatus.LUNAS]: 'Lunas',
};

export const WARNA_STATUS_BAYAR: Record<PaymentStatus, string> = {
  [PaymentStatus.BELUM_BAYAR]:
    'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
  [PaymentStatus.DP]:
    'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
  [PaymentStatus.LUNAS]:
    'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100',
};

export const LABEL_METODE_BAYAR: Record<PaymentMethod, string> = {
  [PaymentMethod.TUNAI]: 'Tunai',
  [PaymentMethod.TRANSFER]: 'Transfer',
  [PaymentMethod.QRIS]: 'QRIS',
  [PaymentMethod.EWALLET]: 'E-Wallet',
};

// --- Notifikasi WhatsApp (Fase 2) -----------------------------------------

export enum JenisNotifikasi {
  SIAP_AMBIL = 'SIAP_AMBIL',
  PESANAN_MASUK = 'PESANAN_MASUK',
  TES = 'TES',
}

export enum StatusNotifikasi {
  TERKIRIM = 'TERKIRIM',
  GAGAL = 'GAGAL',
  /** Dirender dan dicatat, tapi tidak benar-benar dikirim (tanpa kredensial). */
  SIMULASI = 'SIMULASI',
}

export const LABEL_JENIS_NOTIFIKASI: Record<JenisNotifikasi, string> = {
  [JenisNotifikasi.SIAP_AMBIL]: 'Cucian Siap Diambil',
  [JenisNotifikasi.PESANAN_MASUK]: 'Struk Pesanan Masuk',
  [JenisNotifikasi.TES]: 'Tes Kirim',
};

export const WARNA_STATUS_NOTIFIKASI: Record<StatusNotifikasi, string> = {
  [StatusNotifikasi.TERKIRIM]:
    'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100',
  [StatusNotifikasi.GAGAL]:
    'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
  [StatusNotifikasi.SIMULASI]:
    'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-100',
};

export const LABEL_STATUS_NOTIFIKASI: Record<StatusNotifikasi, string> = {
  [StatusNotifikasi.TERKIRIM]: 'Terkirim',
  [StatusNotifikasi.GAGAL]: 'Gagal',
  [StatusNotifikasi.SIMULASI]: 'Simulasi',
};

/** Variabel yang boleh dipakai di template pesan. */
export const VARIABEL_TEMPLATE = [
  'nama',
  'nota',
  'outlet',
  'total',
  'sisa',
  'item',
  'estimasi',
  'telepon_outlet',
] as const;

export const TEMPLATE_SIAP_AMBIL_BAWAAN = `Halo {nama}, cucian Anda dengan nota {nota} sudah selesai dan siap diambil.

Rincian: {item}
Sisa tagihan: {sisa}

Terima kasih sudah mempercayakan cucian Anda ke {outlet}.`;

export const TEMPLATE_PESANAN_MASUK_BAWAAN = `Halo {nama}, terima kasih. Cucian Anda sudah kami terima.

Nota: {nota}
Rincian: {item}
Total: {total}
Estimasi selesai: {estimasi}

{outlet} - {telepon_outlet}`;

// --- Langganan & penagihan (Fase 3) ---------------------------------------

export enum StatusLangganan {
  TRIAL = 'TRIAL',
  AKTIF = 'AKTIF',
  KEDALUWARSA = 'KEDALUWARSA',
}

export enum SiklusTagihan {
  BULANAN = 'BULANAN',
  TAHUNAN = 'TAHUNAN',
}

export enum StatusInvoice {
  MENUNGGU = 'MENUNGGU',
  DIBAYAR = 'DIBAYAR',
  KEDALUWARSA = 'KEDALUWARSA',
  BATAL = 'BATAL',
}

export const LABEL_STATUS_LANGGANAN: Record<StatusLangganan, string> = {
  [StatusLangganan.TRIAL]: 'Uji Coba',
  [StatusLangganan.AKTIF]: 'Aktif',
  [StatusLangganan.KEDALUWARSA]: 'Kedaluwarsa',
};

export const WARNA_STATUS_LANGGANAN: Record<StatusLangganan, string> = {
  [StatusLangganan.TRIAL]:
    'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100',
  [StatusLangganan.AKTIF]:
    'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100',
  [StatusLangganan.KEDALUWARSA]:
    'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
};

export const LABEL_SIKLUS: Record<SiklusTagihan, string> = {
  [SiklusTagihan.BULANAN]: 'Bulanan',
  [SiklusTagihan.TAHUNAN]: 'Tahunan',
};

export const LABEL_STATUS_INVOICE: Record<StatusInvoice, string> = {
  [StatusInvoice.MENUNGGU]: 'Menunggu Pembayaran',
  [StatusInvoice.DIBAYAR]: 'Dibayar',
  [StatusInvoice.KEDALUWARSA]: 'Kedaluwarsa',
  [StatusInvoice.BATAL]: 'Batal',
};

export const WARNA_STATUS_INVOICE: Record<StatusInvoice, string> = {
  [StatusInvoice.MENUNGGU]:
    'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
  [StatusInvoice.DIBAYAR]:
    'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-100',
  [StatusInvoice.KEDALUWARSA]:
    'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-100',
  [StatusInvoice.BATAL]:
    'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
};

/** Paket bawaan platform. Kode dipakai di seed dan di logika trial. */
export const KODE_PAKET = {
  GRATIS: 'gratis',
  PRO: 'pro',
  BISNIS: 'bisnis',
} as const;

/** Lama uji coba untuk tenant baru, dalam hari. */
export const HARI_TRIAL = 14;

// --- Email transaksional (Fase 4) -----------------------------------------

export enum JenisEmail {
  UNDANGAN = 'UNDANGAN',
  RESET_PASSWORD = 'RESET_PASSWORD',
}

export enum StatusEmail {
  TERKIRIM = 'TERKIRIM',
  GAGAL = 'GAGAL',
  /** Dirender dan dicatat, tapi tidak benar-benar dikirim (tanpa kredensial). */
  SIMULASI = 'SIMULASI',
}

export const LABEL_JENIS_EMAIL: Record<JenisEmail, string> = {
  [JenisEmail.UNDANGAN]: 'Undangan Anggota',
  [JenisEmail.RESET_PASSWORD]: 'Reset Password',
};

/** Masa berlaku token reset password, dalam menit. */
export const MENIT_TOKEN_RESET = 60;

/** Maksimal permintaan reset per email per jam. */
export const MAKS_PERMINTAAN_RESET = 3;
