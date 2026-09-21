# syntax=docker/dockerfile:1

# =============================================================================
# LaundryKu — image produksi
#
# Catatan penting soal build:
# `next build` TIDAK membutuhkan database. Halaman /pricing sengaja dibuat
# `force-dynamic` supaya tidak ikut di-prerender — kalau di-prerender, build di
# dalam image ini gagal dengan ECONNREFUSED karena Postgres memang belum ada
# saat image dibangun.
#
# Image ini sengaja membawa node_modules produksi lengkap (bukan output
# `standalone`) supaya satu image yang sama bisa dipakai untuk tiga hal:
# menjalankan aplikasi, menjalankan migrasi, dan menjalankan seed. Tukarannya
# ukuran image lebih besar; imbalannya tidak ada langkah deploy yang butuh
# tooling terpisah.
# =============================================================================

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- Dependensi lengkap (untuk build) ----------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile

# --- Build -------------------------------------------------------------------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nilai palsu hanya supaya modul yang memvalidasi env tidak melempar saat build.
# Tidak pernah dipakai menghubungi apa pun — koneksi asli datang dari env
# runtime yang di-set di EasyPanel.
ENV POSTGRES_URL="postgresql://build:build@127.0.0.1:5432/build"
ENV AUTH_SECRET="build-time-placeholder"
RUN pnpm build

# --- Runtime -----------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Dependensi produksi saja. `drizzle-kit` dan `tsx` ada di dependencies, jadi
# migrasi dan seed bisa dijalankan dari dalam container tanpa mengunduh apa pun
# dari internet saat deploy.
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm install --frozen-lockfile --prod

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Dibutuhkan migrasi & seed saat container start
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/tsconfig.json ./tsconfig.json

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Jangan jalan sebagai root.
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "start"]
