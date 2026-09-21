import { ServiceType } from './enums';

/**
 * Layanan siap pakai yang ditawarkan saat onboarding.
 *
 * Alasannya: laundry baru tidak tahu harus mengisi apa, dan halaman Layanan
 * yang kosong membuat POS tidak bisa dipakai sama sekali. Harga di sini hanya
 * titik awal yang wajar — pemilik menyesuaikannya di menu Layanan.
 */
export const LAYANAN_BAWAAN = [
  {
    kunci: 'cuci-kering-lipat',
    nama: 'Cuci Kering Lipat',
    tipe: ServiceType.KILOAN,
    satuan: 'kg',
    hargaDefault: 7000,
    minQty: 3,
    durasiJam: 72,
    expressMultiplier: 1.5,
    expressDurasiJam: 24,
    disarankan: true,
  },
  {
    kunci: 'cuci-kering-setrika',
    nama: 'Cuci Kering Setrika',
    tipe: ServiceType.KILOAN,
    satuan: 'kg',
    hargaDefault: 9000,
    minQty: 3,
    durasiJam: 72,
    expressMultiplier: 1.5,
    expressDurasiJam: 24,
    disarankan: true,
  },
  {
    kunci: 'setrika-saja',
    nama: 'Setrika Saja',
    tipe: ServiceType.KILOAN,
    satuan: 'kg',
    hargaDefault: 5000,
    minQty: 2,
    durasiJam: 48,
    expressMultiplier: 1.5,
    expressDurasiJam: 12,
    disarankan: true,
  },
  {
    kunci: 'bed-cover',
    nama: 'Bed Cover',
    tipe: ServiceType.SATUAN,
    satuan: 'pcs',
    hargaDefault: 35000,
    minQty: 1,
    durasiJam: 96,
    expressMultiplier: 1.5,
    expressDurasiJam: 48,
    disarankan: true,
  },
  {
    kunci: 'selimut',
    nama: 'Selimut / Bed Sheet',
    tipe: ServiceType.SATUAN,
    satuan: 'pcs',
    hargaDefault: 25000,
    minQty: 1,
    durasiJam: 96,
    expressMultiplier: 1.5,
    expressDurasiJam: 48,
    disarankan: false,
  },
  {
    kunci: 'jas',
    nama: 'Jas / Blazer',
    tipe: ServiceType.SATUAN,
    satuan: 'pcs',
    hargaDefault: 30000,
    minQty: 1,
    durasiJam: 120,
    expressMultiplier: 2,
    expressDurasiJam: 48,
    disarankan: false,
  },
  {
    kunci: 'sepatu',
    nama: 'Sepatu',
    tipe: ServiceType.SATUAN,
    satuan: 'pcs',
    hargaDefault: 40000,
    minQty: 1,
    durasiJam: 96,
    expressMultiplier: 1.5,
    expressDurasiJam: 48,
    disarankan: false,
  },
  {
    kunci: 'boneka',
    nama: 'Boneka Besar',
    tipe: ServiceType.SATUAN,
    satuan: 'pcs',
    hargaDefault: 30000,
    minQty: 1,
    durasiJam: 96,
    expressMultiplier: 1.5,
    expressDurasiJam: 48,
    disarankan: false,
  },
] as const;

export type KunciLayananBawaan = (typeof LAYANAN_BAWAAN)[number]['kunci'];
