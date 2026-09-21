/**
 * Halaman 403 yang seragam. Menyebut role yang sedang dipakai supaya user
 * paham kenapa ditolak, bukan sekadar layar kosong.
 */
export function AksesDitolak({
  role,
  keterangan,
}: {
  role: string;
  keterangan: string;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-lg border border-red-300 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950">
        <h1 className="text-lg font-semibold text-red-900 dark:text-red-100">
          Akses ditolak
        </h1>
        <p className="mt-1 text-sm text-red-800 dark:text-red-200">
          Role <strong>{role}</strong> tidak punya akses untuk {keterangan}.
        </p>
      </div>
    </main>
  );
}
