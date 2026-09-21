import 'server-only';

import { getLangganan, getPemakaian, batasTercapai, teksBatas } from './langganan';

/**
 * Penjaga batas paket.
 *
 * Semua fungsi di sini dipanggil dari **server action**, bukan sekadar dipakai
 * menyembunyikan tombol di UI. Menyembunyikan tombol bukan pembatasan — siapa
 * pun bisa memanggil server action langsung dari DevTools.
 *
 * Mengembalikan pesan (bukan melempar) supaya pemanggilnya bisa menampilkannya
 * apa adanya ke pengguna. Pesannya sengaja menyebut paket sekarang, angka
 * batasnya, dan ke mana harus pergi untuk naik paket.
 */

type Pelanggaran = { error: string } | null;

function pesanBatas(
  apa: string,
  namaPaket: string,
  batas: number | null,
  saran = 'Naikkan paket di menu Langganan untuk menambah kapasitas.'
): string {
  return `Batas paket ${namaPaket} tercapai — maksimal ${teksBatas(batas)} ${apa}. ${saran}`;
}

export async function cekBatasOutlet(teamId: number): Promise<Pelanggaran> {
  const [{ paket }, pakai] = await Promise.all([
    getLangganan(teamId),
    getPemakaian(teamId),
  ]);

  if (batasTercapai(pakai.outlet, paket.maxOutlet)) {
    return { error: pesanBatas('outlet aktif', paket.nama, paket.maxOutlet) };
  }
  return null;
}

export async function cekBatasPengguna(teamId: number): Promise<Pelanggaran> {
  const [{ paket }, pakai] = await Promise.all([
    getLangganan(teamId),
    getPemakaian(teamId),
  ]);

  if (batasTercapai(pakai.pengguna, paket.maxPengguna)) {
    return {
      error: pesanBatas(
        'pengguna (termasuk undangan yang belum diterima)',
        paket.nama,
        paket.maxPengguna
      ),
    };
  }
  return null;
}

export async function cekBatasPesanan(teamId: number): Promise<Pelanggaran> {
  const [{ paket }, pakai] = await Promise.all([
    getLangganan(teamId),
    getPemakaian(teamId),
  ]);

  if (batasTercapai(pakai.pesananBulanIni, paket.maxPesananPerBulan)) {
    return {
      error: pesanBatas(
        'pesanan per bulan',
        paket.nama,
        paket.maxPesananPerBulan,
        'Naikkan paket di menu Langganan, atau tunggu bulan berikutnya.'
      ),
    };
  }
  return null;
}
