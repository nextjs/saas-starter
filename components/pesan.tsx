/**
 * Banner pesan sukses/error yang dipakai bersama oleh halaman-halaman kelola.
 * Pakai `role="status"` supaya pembaca layar mengumumkan hasil aksi.
 */
export type IsiPesan = { tipe: 'error' | 'ok'; teks: string };

export function Pesan({ isi }: { isi: IsiPesan | null }) {
  if (!isi) return null;

  return (
    <div
      role="status"
      className={
        isi.tipe === 'error'
          ? 'mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100'
          : 'mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100'
      }
    >
      {isi.teks}
    </div>
  );
}
