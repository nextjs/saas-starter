'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { ALUR_STATUS, LABEL_STATUS, OrderStatus } from '@/lib/laundry/enums';

export function FilterPesanan({
  statusAktif,
  cariAwal,
}: {
  statusAktif: string;
  cariAwal: string;
}) {
  const router = useRouter();
  const [cari, setCari] = useState(cariAwal);
  const [status, setStatus] = useState<string | null>(statusAktif || null);

  function terapkan(statusBaru: string | null, cariBaru: string) {
    const params = new URLSearchParams();
    if (statusBaru) params.set('status', statusBaru);
    if (cariBaru.trim()) params.set('cari', cariBaru.trim());
    const qs = params.toString();
    router.push(qs ? `/dashboard/pesanan?${qs}` : '/dashboard/pesanan');
  }

  return (
    <form
      className="mb-4 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        terapkan(status, cari);
      }}
    >
      <div className="min-w-0 flex-1 sm:max-w-xs">
        <label
          htmlFor="cari"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Cari
        </label>
        <Input
          id="cari"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Nomor nota / nama / no HP"
        />
      </div>

      <div className="w-full sm:w-56">
        <SearchableSelect
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            terapkan(v, cari);
          }}
          placeholder="Semua status"
          options={[...ALUR_STATUS, OrderStatus.BATAL].map((s) => ({
            value: s,
            label: LABEL_STATUS[s],
          }))}
        />
      </div>

      <Button type="submit" variant="outline">
        <Search className="mr-1.5 h-4 w-4" />
        Cari
      </Button>
    </form>
  );
}
