'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { LABEL_PRESET, type Preset } from '@/lib/laundry/periode';

export function FilterLaporan({
  preset,
  dari,
  sampai,
  outlets,
  outletTerpilih,
  outletTerkunci,
}: {
  preset: Preset;
  dari: string;
  sampai: string;
  outlets: { id: number; nama: string }[];
  outletTerpilih: string | null;
  outletTerkunci: boolean;
}) {
  const router = useRouter();
  const [d, setD] = useState(dari);
  const [s, setS] = useState(sampai);

  function terapkan(p: Preset, dd = d, ss = s, outlet = outletTerpilih) {
    const q = new URLSearchParams();
    q.set('periode', p);
    if (p === 'custom') {
      if (!dd || !ss) return;
      q.set('dari', dd);
      q.set('sampai', ss);
    }
    if (outlet) q.set('outlet', outlet);
    router.push(`/dashboard/laporan?${q.toString()}`);
  }

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(LABEL_PRESET) as Preset[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => terapkan(p)}
            aria-pressed={preset === p}
            className={
              preset === p
                ? 'rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-50 dark:text-gray-900'
                : 'rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-600 dark:text-gray-300 dark:hover:bg-zinc-800'
            }
          >
            {LABEL_PRESET[p]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {preset === 'custom' && (
          <>
            <div>
              <Label htmlFor="l-dari">Dari</Label>
              <Input
                id="l-dari"
                type="date"
                value={d}
                onChange={(e) => setD(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="l-sampai">Sampai</Label>
              <Input
                id="l-sampai"
                type="date"
                value={s}
                onChange={(e) => setS(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={() => terapkan('custom')}>
              Terapkan
            </Button>
          </>
        )}

        {!outletTerkunci && outlets.length > 1 && (
          <div className="w-full sm:w-56">
            <SearchableSelect
              label="Outlet"
              value={outletTerpilih}
              onChange={(v) => terapkan(preset, d, s, v)}
              placeholder="Semua outlet"
              options={outlets.map((o) => ({ value: String(o.id), label: o.nama }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
