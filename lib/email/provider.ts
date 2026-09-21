import 'server-only';

/**
 * Adapter pengirim email transaksional.
 *
 * Pola yang sama dengan WhatsApp (Fase 2) dan penagihan (Fase 3): kredensial
 * dari environment, dan tanpa kredensial jatuh ke mode `simulasi` sehingga
 * alurnya bisa diuji tanpa benar-benar mengirim email ke orang.
 *
 * Env yang dipakai:
 *   EMAIL_PROVIDER = resend | smtp | simulasi   (default: simulasi)
 *   EMAIL_FROM     = alamat pengirim, mis. "Laundry SaaS <noreply@domain.com>"
 *   RESEND_API_KEY = kunci Resend
 *   SMTP_URL       = smtp://user:pass@host:port  (dipakai kalau provider = smtp)
 */

export type NamaPengirim = 'resend' | 'smtp' | 'simulasi';

export type HasilKirimEmail = {
  terkirim: boolean;
  simulasi: boolean;
  galat?: string;
};

export function pengirimAktif(): NamaPengirim {
  const p = (process.env.EMAIL_PROVIDER ?? '').toLowerCase();
  if (p === 'resend') return process.env.RESEND_API_KEY ? 'resend' : 'simulasi';
  if (p === 'smtp') return process.env.SMTP_URL ? 'smtp' : 'simulasi';
  return 'simulasi';
}

function alamatPengirim(): string {
  return process.env.EMAIL_FROM ?? 'Laundry SaaS <noreply@laundry-saas.local>';
}

async function kirimResend(
  tujuan: string,
  subjek: string,
  isi: string
): Promise<HasilKirimEmail> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: alamatPengirim(),
      to: [tujuan],
      subject: subjek,
      text: isi,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}) as any);
    return {
      terkirim: false,
      simulasi: false,
      galat: data?.message ?? `HTTP ${res.status}`,
    };
  }
  return { terkirim: true, simulasi: false };
}

async function kirimSmtp(
  tujuan: string,
  subjek: string,
  isi: string
): Promise<HasilKirimEmail> {
  // Diimpor dinamis supaya nodemailer tidak ikut dimuat kalau jalur SMTP
  // memang tidak dipakai.
  try {
    const nodemailer = await import('nodemailer');
    const transport = nodemailer.createTransport(process.env.SMTP_URL!);
    await transport.sendMail({
      from: alamatPengirim(),
      to: tujuan,
      subject: subjek,
      text: isi,
    });
    return { terkirim: true, simulasi: false };
  } catch (error: any) {
    return {
      terkirim: false,
      simulasi: false,
      galat: error?.message ?? 'Gagal mengirim lewat SMTP',
    };
  }
}

/** Tidak pernah melempar — kegagalan dikembalikan sebagai nilai. */
export async function kirimEmail(
  tujuan: string,
  subjek: string,
  isi: string
): Promise<HasilKirimEmail> {
  const pengirim = pengirimAktif();

  if (pengirim === 'simulasi') {
    return { terkirim: false, simulasi: true };
  }

  try {
    return pengirim === 'resend'
      ? await kirimResend(tujuan, subjek, isi)
      : await kirimSmtp(tujuan, subjek, isi);
  } catch (error: any) {
    return {
      terkirim: false,
      simulasi: false,
      galat: error?.message ?? 'Gagal menghubungi penyedia email',
    };
  }
}
