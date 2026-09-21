'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pesan, type IsiPesan } from '@/components/pesan';
import {
  LABEL_SIKLUS,
  LABEL_STATUS_INVOICE,
  SiklusTagihan,
  StatusInvoice,
} from '@/lib/laundry/enums';
import { rupiah } from '@/lib/format';
import { lunasiSimulasi } from '@/lib/billing/actions';

export function SimulasiClient({
  nomorInvoice,
  jumlah,
  status,
  siklus,
  namaPaket,
}: {
  nomorInvoice: string;
  jumlah: number;
  status: string;
  siklus: string;
  namaPaket: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pesan, setPesan] = useState<IsiPesan | null>(null);

  const sudahLunas = status === StatusInvoice.DIBAYAR;

  function bayar() {
    setPesan(null);
    startTransition(async () => {
      const hasil = await lunasiSimulasi(nomorInvoice);
      if (hasil.error) {
        setPesan({ tipe: 'error', teks: hasil.error });
        return;
      }
      setPesan({ tipe: 'ok', teks: hasil.success! });
      router.refresh();
    });
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900">
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Ini halaman <strong>simulasi</strong>, bukan pembayaran sungguhan. Tidak ada
            uang yang berpindah. Halaman ini otomatis tidak bisa dibuka begitu gateway asli
            diaktifkan.
          </p>
        </div>

        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Tagihan {nomorInvoice}
        </h1>

        <dl className="mt-4 space-y-2 text-sm">
          <Baris label="Paket" nilai={namaPaket} />
          <Baris
            label="Siklus"
            nilai={LABEL_SIKLUS[siklus as SiklusTagihan] ?? siklus}
          />
          <Baris
            label="Status"
            nilai={LABEL_STATUS_INVOICE[status as StatusInvoice] ?? status}
          />
          <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-zinc-700">
            <dt className="font-semibold text-gray-900 dark:text-gray-50">
              Total bayar
            </dt>
            <dd className="text-lg font-bold text-gray-900 dark:text-gray-50">
              {rupiah(jumlah)}
            </dd>
          </div>
        </dl>

        <div className="mt-5">
          <Pesan isi={pesan} />

          {sudahLunas ? (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
              Tagihan ini sudah lunas dan paketnya sudah aktif.
            </p>
          ) : (
            <Button type="button" className="w-full" disabled={pending} onClick={bayar}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Tandai Lunas (Simulasi)'
              )}
            </Button>
          )}

          <Button asChild variant="outline" className="mt-2 w-full">
            <Link href="/dashboard/langganan">Kembali ke Langganan</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function Baris({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-700 dark:text-gray-300">{label}</dt>
      <dd className="text-gray-900 dark:text-gray-50">{nilai}</dd>
    </div>
  );
}
