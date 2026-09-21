'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Kontrol lebar kertas + tombol cetak. Semuanya `print:hidden` supaya yang
 * keluar dari printer hanya notanya.
 *
 * 58 mm dan 80 mm adalah dua ukuran printer thermal yang lazim dipakai kasir
 * di Indonesia; lebar cetak efektifnya kira-kira 48 mm dan 72 mm.
 */
const LEBAR = {
  '58': { label: '58 mm', px: 189 },
  '80': { label: '80 mm', px: 272 },
} as const;

type Ukuran = keyof typeof LEBAR;

export function KontrolNota({ orderId }: { orderId: number }) {
  const [ukuran, setUkuran] = useState<Ukuran>('80');

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--lebar-nota',
      `${LEBAR[ukuran].px}px`
    );
  }, [ukuran]);

  return (
    <>
      {/*
        Nota harus tercetak hitam di atas putih apa pun tema layarnya, dan
        halaman selain #nota tidak boleh ikut keluar.
      */}
      <style>{`
        @media print {
          @page { margin: 4mm; }
          body { background: #fff !important; }
          body * { visibility: hidden; }
          #nota, #nota * { visibility: visible; }
          #nota {
            position: absolute;
            left: 0;
            top: 0;
            color: #000 !important;
            background: #fff !important;
          }
        }
      `}</style>

      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 pt-6 print:hidden">
        <Link
          href={`/dashboard/pesanan/${orderId}`}
          className="text-sm text-gray-600 hover:underline dark:text-gray-400"
        >
          ← Kembali ke detail pesanan
        </Link>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Lebar kertas"
            className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {(Object.keys(LEBAR) as Ukuran[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setUkuran(k)}
                aria-pressed={ukuran === k}
                className={
                  ukuran === k
                    ? 'rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-900 dark:bg-zinc-700 dark:text-gray-50'
                    : 'rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-700'
                }
              >
                {LEBAR[k].label}
              </button>
            ))}
          </div>

          <Button type="button" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" />
            Cetak
          </Button>
        </div>
      </div>
    </>
  );
}
