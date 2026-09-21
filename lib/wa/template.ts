import { kuantitas, rupiah, tanggalJam } from '@/lib/format';

/**
 * Render template pesan WhatsApp.
 *
 * Variabel yang tidak dikenal sengaja **dibiarkan apa adanya**, bukan dihapus.
 * Kalau pemilik salah ketik `{namaa}`, dia akan melihatnya utuh saat mengetes —
 * jauh lebih baik daripada kalimat yang diam-diam bolong di pesan pelanggan.
 */
export function renderTemplate(
  template: string,
  variabel: Record<string, string>
): string {
  return template.replace(/\{(\w+)\}/g, (utuh, kunci) =>
    kunci in variabel ? variabel[kunci] : utuh
  );
}

export type DataPesan = {
  pelanggan: { nama: string };
  outlet: { nama: string; telepon: string | null };
  order: { nomorNota: string; total: number; estimasiSelesai: Date | string };
  items: { namaLayanan: string; qty: string; satuan: string; isExpress: boolean }[];
  dibayar: number;
};

/** "Cuci Kering Lipat 4 kg (Express), Bed Cover 2 pcs" */
export function ringkasItem(items: DataPesan['items']): string {
  return items
    .map(
      (i) =>
        `${i.namaLayanan} ${kuantitas(i.qty, i.satuan)}${i.isExpress ? ' (Express)' : ''}`
    )
    .join(', ');
}

export function variabelDari(data: DataPesan): Record<string, string> {
  const sisa = Math.max(0, data.order.total - data.dibayar);
  return {
    nama: data.pelanggan.nama,
    nota: data.order.nomorNota,
    outlet: data.outlet.nama,
    total: rupiah(data.order.total),
    sisa: sisa > 0 ? rupiah(sisa) : 'Lunas',
    item: ringkasItem(data.items),
    estimasi: tanggalJam(data.order.estimasiSelesai),
    telepon_outlet: data.outlet.telepon ?? '-',
  };
}

/** Contoh data untuk pratinjau template di halaman pengaturan. */
export const CONTOH_VARIABEL: Record<string, string> = {
  nama: 'Budi Santoso',
  nota: 'PST-260825-001',
  outlet: 'LaundryKu Pusat',
  total: 'Rp 112.000',
  sisa: 'Rp 62.000',
  item: 'Cuci Kering Lipat 4 kg (Express), Bed Cover 2 pcs',
  estimasi: '29 Agu 2026, 21.39',
  telepon_outlet: '081234567890',
};
