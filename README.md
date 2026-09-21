# Laundry SaaS

Aplikasi SaaS multi-tenant untuk operasional **laundry** — dibangun dengan Next.js, PostgreSQL, Drizzle ORM, dan auth berbasis JWT.

> Repo ini awalnya di-fork dari [nextjs/saas-starter](https://github.com/nextjs/saas-starter) (MIT), lalu dikembangkan penuh menjadi aplikasi laundry. Riwayat upstream sudah tidak relevan — source of truth-nya adalah **repo ini**.

## Fitur

- Landing page + halaman harga (FREE / PRO / BUSINESS)
- Multi-tenant per toko — tiap tenant punya data terisolasi
- Dashboard order, pelanggan, dan transaksi
- Auth email/password, JWT di cookie
- Middleware global proteksi route
- Siap deploy ke EasyPanel (Dockerfile + entrypoint included)

## Tech Stack

- **Next.js** (App Router)
- **PostgreSQL** + **Drizzle ORM**
- **Tailwind CSS**
- **JWT** auth

## Menjalankan lokal

```bash
pnpm install
pnpm dev
```

Buka http://localhost:3000

## Environment

Salin `.env.example` → `.env`, lalu isi `POSTGRES_URL`.

```bash
POSTGRES_URL=postgresql://user:***@host:5432/laundry
```

## Deploy ke EasyPanel

Lihat [`DEPLOY_EASYPANEL.md`](./DEPLOY_EASYPANEL.md).

- Nama service app: `laundry-saas`
- Nama service DB: `laundry-saas-db`
- Domain: `mylaundy.gampangin.biz.id`

## Dokumen

| File | Isi |
|---|---|
| `DEPLOY_EASYPANEL.md` | Panduan deploy |
| `PROMPT-DEPLOY-HERMES.md` | Prompt deploy siap pakai |
| `PRD-FASE-1.md` … `PRD-FASE-4.md` | Roadmap produk per fase |

## Lisensi

MIT (lihat `LICENSE`).
