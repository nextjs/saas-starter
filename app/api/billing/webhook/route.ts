import { NextRequest, NextResponse } from 'next/server';
import { lunasiInvoice } from '@/lib/billing/invoice';
import { bacaWebhook, gatewayAktif, webhookSah } from '@/lib/billing/provider';

/**
 * Webhook pembayaran langganan.
 *
 * Dua hal yang wajib dipegang di sini:
 *
 * 1. **Verifikasi dulu, proses belakangan.** Tanpa verifikasi tanda tangan,
 *    siapa pun yang tahu URL ini bisa menaikkan paketnya sendiri gratis.
 * 2. **Balas 200 untuk hal yang sudah beres.** Gateway mengirim ulang kalau
 *    tidak dapat 200, dan `lunasiInvoice` memang idempoten — jadi kiriman ulang
 *    tidak menambah masa aktif dua kali.
 */
export async function POST(request: NextRequest) {
  const gateway = gatewayAktif();

  if (gateway === 'simulasi') {
    // Tidak ada gateway sungguhan yang mengirim ke sini; menerima apa pun dalam
    // mode ini sama saja membuka pintu belakang.
    return NextResponse.json(
      { error: 'Webhook nonaktif dalam mode simulasi.' },
      { status: 404 }
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body bukan JSON.' }, { status: 400 });
  }

  const token = request.headers.get('x-callback-token');
  if (!webhookSah(gateway, token, body)) {
    console.warn('Webhook penagihan ditolak: tanda tangan tidak sah.');
    return NextResponse.json({ error: 'Tidak sah.' }, { status: 401 });
  }

  const data = bacaWebhook(gateway, body);
  if (!data) {
    return NextResponse.json({ error: 'Payload tidak dikenal.' }, { status: 400 });
  }

  if (!data.lunas) {
    // Status antara (pending, expired, dsb.) — diakui supaya tidak dikirim ulang.
    return NextResponse.json({ diterima: true, diproses: false });
  }

  const hasil = await lunasiInvoice(data.nomorInvoice, data.referensi);
  if (!hasil.ok) {
    console.error('Gagal melunasi dari webhook:', data.nomorInvoice, hasil.alasan);
    // 404 supaya gateway berhenti mencoba invoice yang memang tidak ada.
    return NextResponse.json({ error: hasil.alasan }, { status: 404 });
  }

  return NextResponse.json({ diterima: true, diproses: true });
}
