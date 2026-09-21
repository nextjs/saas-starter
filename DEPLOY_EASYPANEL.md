# Deploy Laundry SaaS ke VPS + EasyPanel

Panduan ini mengasumsikan VPS dengan EasyPanel terpasang, dan Postgres dijalankan
sebagai service EasyPanel di VPS yang sama.

**Perkiraan waktu:** 30–45 menit, di luar menunggu DNS menyebar.

---

## 0. Sebelum mulai

| Kebutuhan | Catatan |
|---|---|
| VPS RAM | **Minimal 2 GB, disarankan 4 GB.** `next build` cukup rakus; di 1 GB ia akan kena OOM, apalagi berbarengan dengan Postgres di mesin yang sama. |
| Disk | 20 GB cukup untuk aplikasi + Postgres + beberapa image lama |
| Domain | Sudah diarahkan A record ke IP VPS |

Kalau RAM VPS pas-pasan, tambahkan swap 2 GB sebelum deploy pertama — build yang
kena OOM gagalnya membingungkan (proses terbunuh tanpa pesan jelas).

---

## 1. Buat service Postgres

Di project EasyPanel Anda: **+ Service → Postgres**.

- Name: `laundry-saas-db`
- Password: buat yang panjang dan acak
- Simpan **Internal Connection URL** yang ditampilkan EasyPanel

Bentuknya kira-kira:

```
postgresql://postgres:***@laundry-saas-db:5432/postgres
```

> Hostname-nya **nama service**, bukan `localhost`. Postgres dan aplikasi berada
> di jaringan Docker internal yang sama. Jangan pakai IP publik VPS — selain
> lebih lambat, itu berarti membuka port database ke internet.

---

## 2. Buat service aplikasi

**+ Service → App**, lalu:

**Source** — arahkan ke repository Git ini (branch yang ingin dideploy).

**Build** — pilih **Dockerfile**, path `Dockerfile`.

> Nixpacks juga bisa membangun Next.js, tapi ia tidak akan menjalankan migrasi.
> `Dockerfile` di repo ini sudah membawa entrypoint yang menjalankan migrasi
> setiap kali container start, jadi tidak ada langkah manual yang bisa terlupa.

**Domains** — tambahkan domain Anda, port **3000**, dan **aktifkan HTTPS**.
EasyPanel mengurus sertifikat Let's Encrypt sendiri.

---

## 3. Environment variables

Isi di tab **Environment** milik service aplikasi.

### Wajib

```
POSTGRES_URL=postgresql://postgres:***@laundry-saas-db:5432/postgres
AUTH_SECRET=<hasil perintah di bawah>
BASE_URL=https://domain-anda.com
```

Buat `AUTH_SECRET` dengan:

```bash
openssl rand -hex 32
```

> ### ⚠️ `BASE_URL` adalah kesalahan yang paling mahal di sini
>
> Kalau salah atau lupa diisi, nilainya diam-diam jatuh ke
> `http://localhost:3000` dan **tidak ada error apa pun yang muncul**. Yang
> terjadi:
>
> - Tautan **undangan anggota** mengarah ke localhost → tidak bisa diklik siapa pun
> - Tautan **reset password** mengarah ke localhost → pengguna terkunci permanen
> - **Redirect setelah bayar** Xendit/Midtrans gagal
>
> Semuanya tampak "berhasil terkirim" di layar. Isi dengan domain lengkap
> berikut `https://`, tanpa garis miring di akhir.

### Notifikasi WhatsApp

Kosongkan untuk mode simulasi (pesan dicatat, tidak dikirim):

```
WA_PROVIDER=fonnte
WA_TOKEN=<token dari dashboard Fonnte>
```

### Email transaksional

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=<kunci Resend>
EMAIL_FROM=Laundry SaaS <noreply@domain-anda.com>
```

Atau lewat SMTP:

```
EMAIL_PROVIDER=smtp
SMTP_URL=smtps://user:password@smtp.domain.com:465
EMAIL_FROM=Laundry SaaS <noreply@domain-anda.com>
```

> **Jangan mengirim email langsung dari IP VPS.** IP VPS baru hampir selalu
> masuk folder spam atau ditolak mentah-mentah. Pakai Resend atau SMTP pihak
> ketiga, dan pasang SPF + DKIM untuk domain Anda.

### Penagihan langganan

```
BILLING_PROVIDER=xendit
XENDIT_SECRET_KEY=<secret key Xendit>
XENDIT_CALLBACK_TOKEN=<callback token Xendit>
```

Atau Midtrans:

```
BILLING_PROVIDER=midtrans
MIDTRANS_SERVER_KEY=<server key Midtrans>
```

Selama ketiganya dikosongkan, aplikasi berjalan dalam **mode simulasi** dan tetap
berfungsi penuh — cocok untuk uji coba dengan beberapa laundry sebelum menagih
uang sungguhan.

### Opsional

```
JALANKAN_MIGRASI=true   # default true; set false hanya kalau migrasi dijalankan terpisah
SEED_PAKET=true         # default true; menyiapkan paket Gratis/Pro/Bisnis, idempoten
```

---

## 4. Deploy

Klik **Deploy**. Yang terjadi berurutan:

1. Image dibangun dari `Dockerfile`
2. Container start → `docker-entrypoint.sh` menunggu Postgres siap (maks 60 detik)
3. Migrasi dijalankan (`drizzle-kit migrate`) — aman diulang
4. Paket langganan disiapkan (upsert, aman diulang)
5. Aplikasi menyala di port 3000

Pantau log di tab **Logs**. Deploy yang sehat menampilkan:

```
==> Database siap.
==> Menjalankan migrasi database...
==> Migrasi selesai.
==> Menyiapkan paket langganan...
3 paket disiapkan.
==> Menjalankan aplikasi: pnpm start
```

---

## 5. Verifikasi

```bash
curl https://domain-anda.com/api/health
```

Harus membalas:

```json
{"status":"ok","db":"ok"}
```

Health check ini sengaja ikut menyentuh database — container yang hidup tapi
tidak bisa menghubungi Postgres tetap tidak berguna.

Lalu buka `https://domain-anda.com/sign-up`, buat akun pertama, dan selesaikan
onboarding (outlet + layanan). Setelah itu POS langsung bisa dipakai.

---

## 6. Webhook pembayaran

Kalau memakai Xendit/Midtrans, daftarkan URL ini di dashboard mereka:

```
https://domain-anda.com/api/billing/webhook
```

Webhook **wajib lolos verifikasi tanda tangan** — Xendit lewat header
`x-callback-token` (harus cocok dengan `XENDIT_CALLBACK_TOKEN`), Midtrans lewat
`signature_key` SHA-512. Selama `BILLING_PROVIDER=simulasi`, endpoint ini
sengaja membalas 404 supaya tidak ada pintu belakang.

---

## 7. Backup — jangan dilewati

EasyPanel punya backup terjadwal untuk service Postgres. **Aktifkan, dan arahkan
tujuannya ke luar VPS** (S3, Cloudflare R2, Backblaze B2, atau DigitalOcean
Spaces).

> Backup yang tersimpan di disk VPS yang sama bukan backup. Kalau disknya rusak,
> database dan cadangannya hilang bersamaan.

Ini data nafkah pelanggan Anda — nama, nomor HP, dan riwayat transaksi pelanggan
mereka. Uji pemulihannya sekali di awal, jangan menunggu sampai benar-benar
dibutuhkan.

---

## 8. Yang masih harus disiapkan di luar teknis

Deploy selesai bukan berarti siap dijual:

- **Syarat & Ketentuan** dan **Kebijakan Privasi** — wajib menurut UU PDP
  No. 27/2022 karena Anda memproses data pribadi pelanggan milik tenant
- **Rate limit login** — belum ada di aplikasi
- **Verifikasi email saat pendaftaran** — belum ada
- **Panel super-admin** — belum ada; memantau tenant masih lewat `psql`

Daftar lengkapnya ada di [README.md](README.md) bagian "Belum ada".

---

## Masalah yang sering muncul

| Gejala | Penyebab paling sering |
|---|---|
| Build terbunuh tanpa pesan jelas | RAM habis. Tambah swap atau naikkan ukuran VPS. |
| `Database tidak bisa dihubungi setelah 30 percobaan` | `POSTGRES_URL` salah — cek nama service dan password |
| Tautan reset/undangan mengarah ke `localhost` | `BASE_URL` belum diisi |
| Email tidak sampai | `EMAIL_PROVIDER` masih `simulasi`, atau SPF/DKIM belum dipasang |
| WhatsApp tidak terkirim tapi tidak error | `WA_PROVIDER` masih `simulasi` — cek Riwayat Pengiriman di menu Notifikasi WA |
| Halaman Langganan error | Tabel paket kosong. Jalankan ulang deploy dengan `SEED_PAKET=true`. |
| `sorry, too many clients already` | Terlalu banyak replika aplikasi terhadap `max_connections` Postgres. Pool tiap container dibatasi 10 di `lib/db/drizzle.ts`. |

### Menjalankan perintah manual

Kalau perlu, buka **Console** pada service aplikasi di EasyPanel:

```bash
pnpm db:migrate        # jalankan migrasi manual
pnpm db:seed:paket     # siapkan ulang paket langganan
```

Jangan jalankan `pnpm db:seed` atau `pnpm db:seed:laundry` di produksi — keduanya
membuat akun contoh `test@test.com` dan data laundry palsu.
