import { notFound, redirect } from 'next/navigation';
import { getKonteks, getOrderDetail } from '@/lib/laundry/queries';
import {
  LABEL_STATUS_BAYAR,
  PaymentStatus,
} from '@/lib/laundry/enums';
import { kuantitas, rupiah, tanggalJam } from '@/lib/format';
import { KontrolNota } from './kontrol-nota';

export default async function NotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const konteks = await getKonteks();
  if (!konteks) redirect('/sign-in');

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const detail = await getOrderDetail(konteks.teamId, orderId);
  if (!detail) notFound();

  const { order, outlet, customer, items, dibayar } = detail;
  const sisa = Math.max(0, order.total - dibayar);

  return (
    <>
      <KontrolNota orderId={order.id} />

      {/*
        Nota dicetak ke printer thermal (58 mm / 80 mm). Lebar diatur lewat
        variabel CSS --lebar-nota yang di-set oleh KontrolNota, dan `print:`
        menyembunyikan seluruh kromnya saat dicetak.
      */}
      <div
        id="nota"
        className="mx-auto my-6 bg-white p-3 font-mono text-[11px] leading-tight text-black print:my-0 print:p-0"
        style={{ width: 'var(--lebar-nota, 302px)' }}
      >
        <div className="text-center">
          <p className="text-sm font-bold uppercase">{outlet.nama}</p>
          {outlet.alamat && <p>{outlet.alamat}</p>}
          {outlet.telepon && <p>Telp/WA: {outlet.telepon}</p>}
        </div>

        <Garis />

        <Pasangan kiri="No. Nota" kanan={order.nomorNota} tebal />
        <Pasangan kiri="Masuk" kanan={tanggalJam(order.tanggalMasuk)} />
        <Pasangan kiri="Estimasi" kanan={tanggalJam(order.estimasiSelesai)} />

        <Garis />

        <p className="font-bold">{customer.nama}</p>
        <p>{customer.telepon}</p>
        {customer.alamat && <p className="break-words">{customer.alamat}</p>}

        <Garis />

        {items.map((it) => (
          <div key={it.id} className="mb-1.5">
            <p className="font-bold">
              {it.namaLayanan}
              {it.isExpress && ' [EXPRESS]'}
            </p>
            <div className="flex justify-between">
              <span>
                {kuantitas(it.qty, it.satuan)} x {rupiah(it.hargaSatuan)}
              </span>
              <span>{rupiah(it.subtotal)}</span>
            </div>
            {it.catatan && <p className="italic">* {it.catatan}</p>}
          </div>
        ))}

        <Garis />

        <Pasangan kiri="Subtotal" kanan={rupiah(order.subtotal)} />
        {order.diskon > 0 && (
          <Pasangan kiri="Diskon" kanan={`- ${rupiah(order.diskon)}`} />
        )}
        <Pasangan kiri="TOTAL" kanan={rupiah(order.total)} tebal />
        <Pasangan kiri="Dibayar" kanan={rupiah(dibayar)} />
        <Pasangan kiri="Sisa" kanan={rupiah(sisa)} tebal />
        <Pasangan
          kiri="Status"
          kanan={
            LABEL_STATUS_BAYAR[order.statusBayar as PaymentStatus] ?? order.statusBayar
          }
        />

        {order.catatan && (
          <>
            <Garis />
            <p className="break-words">Catatan: {order.catatan}</p>
          </>
        )}

        <Garis />

        <div className="text-center">
          <p>Terima kasih 🙏</p>
          <p className="mt-1">Simpan nota ini sebagai bukti pengambilan.</p>
          <p className="mt-1">Barang tidak diambil &gt; 30 hari</p>
          <p>di luar tanggung jawab kami.</p>
        </div>
      </div>
    </>
  );
}

function Garis() {
  return <p className="my-1.5 overflow-hidden whitespace-nowrap">{'-'.repeat(48)}</p>;
}

function Pasangan({
  kiri,
  kanan,
  tebal,
}: {
  kiri: string;
  kanan: string;
  tebal?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-2 ${tebal ? 'font-bold' : ''}`}>
      <span>{kiri}</span>
      <span className="text-right">{kanan}</span>
    </div>
  );
}
