#!/bin/sh
set -e

# =============================================================================
# Dijalankan setiap container start, sebelum aplikasi menyala.
#
# Migrasi dijalankan di sini, bukan sebagai langkah manual di EasyPanel, karena
# langkah manual pasti terlupakan pada suatu deploy — dan gejalanya bukan error
# yang jelas, melainkan halaman yang gagal satu per satu.
#
# `drizzle-kit migrate` aman diulang: migrasi yang sudah pernah jalan dilewati.
# =============================================================================

echo "==> Menunggu database siap..."
i=0
until node -e "
const postgres = require('postgres');
const sql = postgres(process.env.POSTGRES_URL, { max: 1, idle_timeout: 2, connect_timeout: 5 });
sql\`select 1\`.then(() => sql.end()).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 30 ]; then
    echo "!! Database tidak bisa dihubungi setelah 30 percobaan. Periksa POSTGRES_URL." >&2
    exit 1
  fi
  echo "    belum siap, coba lagi ($i/30)..."
  sleep 2
done
echo "==> Database siap."

if [ "${JALANKAN_MIGRASI:-true}" = "true" ]; then
  echo "==> Menjalankan migrasi database..."
  pnpm db:migrate
  echo "==> Migrasi selesai."
else
  echo "==> JALANKAN_MIGRASI=false, migrasi dilewati."
fi

# Paket langganan adalah data acuan platform, bukan data tenant. Tanpa isinya,
# halaman Langganan melempar error. Seed ini idempoten (upsert berdasarkan kode).
if [ "${SEED_PAKET:-true}" = "true" ]; then
  echo "==> Menyiapkan paket langganan..."
  pnpm db:seed:paket
fi

echo "==> Menjalankan aplikasi: $*"
exec "$@"
