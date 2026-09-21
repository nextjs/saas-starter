import 'server-only';

import { createHash } from 'node:crypto';

/**
 * Adapter gateway pembayaran langganan.
 *
 * Polanya sama dengan adapter WhatsApp di Fase 2, dan alasannya sama:
 * kredensial dari environment (bukan database), dan tanpa kredensial jatuh ke
 * mode `simulasi` sehingga alur upgrade bisa diuji utuh secara lokal tanpa uang
 * sungguhan dan tanpa akun provider.
 *
 * Env yang dipakai:
 *   BILLING_PROVIDER        = xendit | midtrans | simulasi   (default: simulasi)
 *   XENDIT_SECRET_KEY       = kunci rahasia Xendit
 *   XENDIT_CALLBACK_TOKEN   = token verifikasi webhook Xendit
 *   MIDTRANS_SERVER_KEY     = server key Midtrans
 *   BASE_URL                = dipakai untuk URL kembali & webhook
 */

export type NamaGateway = 'xendit' | 'midtrans' | 'simulasi';

export type HasilInvoice = {
  berhasil: boolean;
  simulasi: boolean;
  urlBayar?: string;
  referensi?: string;
  galat?: string;
};

export function gatewayAktif(): NamaGateway {
  const p = (process.env.BILLING_PROVIDER ?? '').toLowerCase();
  if (p === 'xendit') return process.env.XENDIT_SECRET_KEY ? 'xendit' : 'simulasi';
  if (p === 'midtrans') return process.env.MIDTRANS_SERVER_KEY ? 'midtrans' : 'simulasi';
  return 'simulasi';
}

function baseUrl(): string {
  return process.env.BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
}

export type PermintaanInvoice = {
  nomorInvoice: string;
  jumlah: number;
  namaPaket: string;
  emailPembeli: string;
};

async function buatInvoiceXendit(r: PermintaanInvoice): Promise<HasilInvoice> {
  const auth = Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString('base64');
  const res = await fetch('https://api.xendit.co/v2/invoices', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: r.nomorInvoice,
      amount: r.jumlah,
      description: `Langganan LaundryKu — paket ${r.namaPaket}`,
      payer_email: r.emailPembeli,
      success_redirect_url: `${baseUrl()}/dashboard/langganan?bayar=sukses`,
      failure_redirect_url: `${baseUrl()}/dashboard/langganan?bayar=gagal`,
      currency: 'IDR',
    }),
  });

  const data = await res.json().catch(() => ({}) as any);
  if (!res.ok) {
    return {
      berhasil: false,
      simulasi: false,
      galat: data?.message ?? `HTTP ${res.status}`,
    };
  }
  return {
    berhasil: true,
    simulasi: false,
    urlBayar: data?.invoice_url,
    referensi: data?.id,
  };
}

async function buatInvoiceMidtrans(r: PermintaanInvoice): Promise<HasilInvoice> {
  const auth = Buffer.from(`${process.env.MIDTRANS_SERVER_KEY}:`).toString('base64');
  const res = await fetch('https://app.midtrans.com/snap/v1/transactions', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      transaction_details: {
        order_id: r.nomorInvoice,
        gross_amount: r.jumlah,
      },
      customer_details: { email: r.emailPembeli },
      item_details: [
        {
          id: r.namaPaket,
          price: r.jumlah,
          quantity: 1,
          name: `Langganan ${r.namaPaket}`,
        },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}) as any);
  if (!res.ok) {
    return {
      berhasil: false,
      simulasi: false,
      galat: data?.error_messages?.join(', ') ?? `HTTP ${res.status}`,
    };
  }
  return {
    berhasil: true,
    simulasi: false,
    urlBayar: data?.redirect_url,
    referensi: data?.token,
  };
}

/** Tidak pernah melempar — kegagalan dikembalikan sebagai nilai. */
export async function buatInvoiceGateway(
  r: PermintaanInvoice
): Promise<HasilInvoice> {
  const gateway = gatewayAktif();

  if (gateway === 'simulasi') {
    // Halaman internal berisi tombol "Tandai Lunas (Simulasi)".
    return {
      berhasil: true,
      simulasi: true,
      urlBayar: `/dashboard/langganan/simulasi/${encodeURIComponent(r.nomorInvoice)}`,
    };
  }

  try {
    return gateway === 'xendit'
      ? await buatInvoiceXendit(r)
      : await buatInvoiceMidtrans(r);
  } catch (error: any) {
    return {
      berhasil: false,
      simulasi: false,
      galat: error?.message ?? 'Gagal menghubungi gateway',
    };
  }
}

/**
 * Verifikasi keaslian webhook.
 *
 * Tanpa ini, siapa pun yang menebak URL webhook bisa menaikkan paketnya sendiri
 * secara gratis. Karena itu webhook yang tidak lolos verifikasi ditolak, bukan
 * diproses "sekadar untuk aman".
 */
export function webhookSah(
  gateway: NamaGateway,
  headerToken: string | null,
  body: any
): boolean {
  if (gateway === 'xendit') {
    const token = process.env.XENDIT_CALLBACK_TOKEN;
    return Boolean(token) && headerToken === token;
  }

  if (gateway === 'midtrans') {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey || !body?.signature_key) return false;
    const bahan = `${body.order_id}${body.status_code}${body.gross_amount}${serverKey}`;
    const hitung = createHash('sha512').update(bahan).digest('hex');
    return hitung === body.signature_key;
  }

  // Mode simulasi tidak menerima webhook dari luar — pelunasannya lewat
  // server action yang sudah dilindungi sesi login.
  return false;
}

/** Menormalkan payload beragam gateway jadi satu bentuk. */
export function bacaWebhook(
  gateway: NamaGateway,
  body: any
): { nomorInvoice: string; lunas: boolean; referensi?: string } | null {
  if (gateway === 'xendit') {
    if (!body?.external_id) return null;
    return {
      nomorInvoice: body.external_id,
      lunas: body.status === 'PAID' || body.status === 'SETTLED',
      referensi: body.id,
    };
  }

  if (gateway === 'midtrans') {
    if (!body?.order_id) return null;
    const status = body.transaction_status;
    const lunas =
      status === 'settlement' ||
      (status === 'capture' && body.fraud_status === 'accept');
    return { nomorInvoice: body.order_id, lunas, referensi: body.transaction_id };
  }

  return null;
}
