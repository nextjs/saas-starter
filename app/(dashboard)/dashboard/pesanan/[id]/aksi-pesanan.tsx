'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
  LABEL_METODE_BAYAR,
  LABEL_STATUS,
  OrderStatus,
  PaymentMethod,
  TeamRole,
} from '@/lib/laundry/enums';
import { statusBerikutnya } from '@/lib/laundry/pricing';
import { angka, parseRupiah, rupiah } from '@/lib/format';
import { catatPembayaran, ubahStatusPesanan } from '@/lib/laundry/actions';
import { kirimUlangNotifikasi } from '@/lib/wa/actions';
import { JenisNotifikasi } from '@/lib/laundry/enums';

export function AksiPesanan({
  orderId,
  status,
  sisa,
  role,
}: {
  orderId: number;
  status: string;
  sisa: number;
  role: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<{ tipe: 'error' | 'ok'; teks: string } | null>(null);
  const [jumlah, setJumlah] = useState('0');
  const [metode, setMetode] = useState<string | null>(PaymentMethod.TUNAI);

  const berikutnya = statusBerikutnya(status);
  const sudahBerakhir = status === OrderStatus.SELESAI || status === OrderStatus.BATAL;
  const bolehBayar = [TeamRole.OWNER, TeamRole.MANAJER, TeamRole.KASIR].includes(
    role as TeamRole
  );

  function jalankanStatus(target: OrderStatus) {
    setPesan(null);
    startTransition(async () => {
      const hasil = await ubahStatusPesanan({ orderId, status: target });
      if (hasil.error) setPesan({ tipe: 'error', teks: hasil.error });
      else {
        setPesan({ tipe: 'ok', teks: hasil.success! });
        router.refresh();
      }
    });
  }

  function simpanBayar() {
    setPesan(null);
    const nilai = parseRupiah(jumlah);
    if (nilai <= 0) {
      setPesan({ tipe: 'error', teks: 'Isi jumlah pembayaran dulu.' });
      return;
    }
    startTransition(async () => {
      const hasil = await catatPembayaran({
        orderId,
        jumlah: nilai,
        metode: (metode as PaymentMethod) ?? PaymentMethod.TUNAI,
      });
      if (hasil.error) setPesan({ tipe: 'error', teks: hasil.error });
      else {
        setPesan({ tipe: 'ok', teks: hasil.success! });
        setJumlah('0');
        router.refresh();
      }
    });
  }

  function kirimUlangWa() {
    setPesan(null);
    startTransition(async () => {
      const hasil = await kirimUlangNotifikasi(orderId, JenisNotifikasi.SIAP_AMBIL);
      setPesan(
        hasil.error
          ? { tipe: 'error', teks: hasil.error }
          : { tipe: 'ok', teks: hasil.success! }
      );
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-50">
        Aksi
      </h2>

      {pesan && (
        <div
          role="status"
          className={
            pesan.tipe === 'error'
              ? 'mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
              : 'mb-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100'
          }
        >
          {pesan.teks}
        </div>
      )}

      {sudahBerakhir ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pesanan sudah {LABEL_STATUS[status as OrderStatus]?.toLowerCase()}.
        </p>
      ) : (
        <div className="space-y-2">
          {berikutnya && (
            <Button
              type="button"
              className="w-full"
              disabled={pending}
              onClick={() => jalankanStatus(berikutnya)}
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Lanjut → ${LABEL_STATUS[berikutnya]}`
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="w-full text-red-700 dark:text-red-400"
            disabled={pending}
            onClick={() => jalankanStatus(OrderStatus.BATAL)}
          >
            Batalkan Pesanan
          </Button>
        </div>
      )}

      <div className="mt-4 border-t border-gray-200 pt-4 dark:border-zinc-700">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={kirimUlangWa}
        >
          <MessageCircle className="mr-1.5 h-4 w-4" />
          Kirim Ulang WhatsApp
        </Button>
        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400">
          Mengirim pesan &quot;cucian siap diambil&quot; ke pelanggan sekarang juga.
        </p>
      </div>

      {bolehBayar && sisa > 0 && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4 dark:border-zinc-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
            Catat Pembayaran
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Sisa tagihan{' '}
            <strong className="text-red-700 dark:text-red-400">{rupiah(sisa)}</strong>
          </p>

          <div>
            <Label htmlFor="jumlah-bayar">Jumlah (Rp)</Label>
            <Input
              id="jumlah-bayar"
              inputMode="numeric"
              value={jumlah === '0' ? '' : angka(parseRupiah(jumlah))}
              onChange={(e) => setJumlah(String(parseRupiah(e.target.value)))}
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => setJumlah(String(sisa))}
              className="mt-1.5 text-xs font-medium text-orange-700 hover:underline dark:text-orange-400"
            >
              Lunasi ({rupiah(sisa)})
            </button>
          </div>

          <SearchableSelect
            label="Metode"
            value={metode}
            onChange={setMetode}
            options={Object.values(PaymentMethod).map((m) => ({
              value: m,
              label: LABEL_METODE_BAYAR[m],
            }))}
          />

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={pending}
            onClick={simpanBayar}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Pembayaran'}
          </Button>
        </div>
      )}
    </div>
  );
}
