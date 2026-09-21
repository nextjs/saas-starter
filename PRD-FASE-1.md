# PRD — LaundryKu Fase 1

**Tujuan Fase 1:** mengubah SaaS starter kosong menjadi aplikasi laundry yang bisa dipakai kasir
untuk mencatat pesanan dan mencetak nota. Belum ada notifikasi WA, belum ada payment gateway,
belum ada laporan — itu Fase 2 & 3.

**Definisi selesai Fase 1:** kasir bisa buka POS, pilih pelanggan, input cucian (kiloan/satuan,
reguler/express), simpan pesanan, lalu cetak nota thermal. Pesanan muncul di daftar dan bisa
diubah statusnya.

---

## 1. Keputusan arsitektur

| Hal | Keputusan | Alasan |
|---|---|---|
| ORM | **Tetap Drizzle** (tidak migrasi ke Prisma) | Auth, session, migrasi sudah jalan di repo ini. Migrasi ke Prisma berarti tulis ulang seluruh auth — biaya besar, nol nilai untuk user. |
| Multi-tenant | `teams` = tenant (pemilik bisnis), `outlets` = cabang di bawahnya | Satu pemilik bisa punya banyak outlet. Semua data laundry terikat ke outlet. |
| Uang | Disimpan **integer Rupiah penuh** (bukan desimal/float) | Rupiah tidak punya sen. Float untuk uang selalu berakhir dengan error pembulatan. |
| Berat | `numeric(6,2)` kg | Timbangan laundry lazim 2 desimal (3,45 kg). |
| Waktu | **`timestamptz`** (bukan `timestamp`) | Tabel lama pakai `timestamp` tanpa timezone — bug. Tabel baru simpan UTC, tampil WIB. |

---

## 2. Entitas

### `outlets` — cabang
| Field | Tipe | Catatan |
|---|---|---|
| id | serial PK | |
| teamId | FK teams | pemilik |
| nama | varchar(100) | "LaundryKu Cabang Malang" |
| kodeNota | varchar(10) | prefix nomor nota, mis. `MLG` |
| alamat, telepon | text / varchar(30) | dicetak di nota |
| aktif | boolean | outlet nonaktif tidak muncul di POS |

### `customers` — pelanggan
| Field | Tipe | Catatan |
|---|---|---|
| id, teamId | | |
| nama | varchar(100) | |
| telepon | varchar(30) | nomor WA — dipakai Fase 2 untuk notifikasi |
| alamat, catatan | text | |

**Unik pada (`teamId`, `telepon`)** supaya pelanggan tidak dobel saat kasir buru-buru.

### `services` — layanan
| Field | Tipe | Catatan |
|---|---|---|
| nama | varchar(100) | "Cuci Kering Lipat" |
| tipe | enum `KILOAN` \| `SATUAN` | menentukan cara input di POS |
| satuan | varchar(10) | `kg` atau `pcs` |
| hargaDefault | integer | Rupiah per kg / per pcs |
| minQty | numeric(6,2) | **minimum charge** — mis. kiloan min 3 kg |
| durasiJam | integer | estimasi selesai reguler (72 jam = 3 hari) |
| expressMultiplier | numeric(3,2) | default `1.50` |
| expressDurasiJam | integer | default 24 |

### `service_prices` — override harga per outlet
Harga bisa beda antar cabang. Kalau tidak ada baris di sini, pakai `services.hargaDefault`.
Unik pada (`serviceId`, `outletId`).

### `orders` — pesanan / nota
| Field | Catatan |
|---|---|
| nomorNota | unik per tenant, format `MLG-260825-001` |
| status | lihat §3 |
| statusBayar | `BELUM_BAYAR` \| `DP` \| `LUNAS` — **diturunkan dari pembayaran, bukan diketik manual** |
| tanggalMasuk, estimasiSelesai, tanggalSelesai, tanggalDiambil | timestamptz |
| subtotal, diskon, total | integer Rupiah |
| catatan | mis. "noda oli di kerah" |

### `order_items` — baris layanan
Menyimpan **snapshot** `namaLayanan`, `tipe`, `satuan`, `hargaSatuan` saat transaksi dibuat.

> Kenapa snapshot: kalau tahun depan harga cuci naik, nota lama harus tetap menampilkan harga
> lama. Tanpa snapshot, semua riwayat nota ikut berubah begitu harga di-update — dan laporan
> omzet bulan lalu jadi bohong.

| Field | Catatan |
|---|---|
| qty | numeric(6,2) — berat kg atau jumlah pcs |
| isExpress | boolean per item (bukan per nota), jadi bisa campur |
| subtotal | integer |

### `order_status_history`
Setiap perubahan status dicatat: status, catatan, siapa yang mengubah, kapan.

### `payments`
| Field | Catatan |
|---|---|
| jumlah | integer Rupiah |
| metode | `TUNAI` \| `TRANSFER` \| `QRIS` \| `EWALLET` |

Satu pesanan boleh punya banyak pembayaran (DP dulu, lunas saat diambil).

---

## 3. Alur status pesanan

```
BARU ──► PROSES_CUCI ──► PROSES_KERING ──► PROSES_SETRIKA ──► SIAP_AMBIL ──► SELESAI
  │                                                                             ▲
  └──────────────────────────── BATAL ◄─────────────────────────────────────────┘
```

- `BARU` — cucian diterima, masuk antrian
- `SIAP_AMBIL` — set `tanggalSelesai`, ini yang memicu notifikasi WA di Fase 2
- `SELESAI` — sudah diambil pelanggan, set `tanggalDiambil`
- `BATAL` — bisa dari status mana pun

---

## 4. Aturan hitung (dikunci, jangan diubah tanpa konfirmasi)

**Per item:**
```
hargaSatuan = isExpress
              ? bulat(hargaDasar × expressMultiplier)
              : hargaDasar

qtyEfektif  = (tipe == KILOAN) ? maksimum(qty, minQty) : qty     ← minimum charge

subtotal    = bulat(hargaSatuan × qtyEfektif)
```

**Per pesanan:**
```
subtotal = Σ item.subtotal
total    = subtotal − diskon                    (diskon nominal Rupiah, manual)
dibayar  = Σ payments.jumlah
sisa     = total − dibayar

statusBayar = sisa ≤ 0    → LUNAS
              dibayar > 0 → DP
              selain itu  → BELUM_BAYAR
```

**Estimasi selesai** = `tanggalMasuk` + jam terlama di antara semua item
(item express pakai `expressDurasiJam`, reguler pakai `durasiJam`).

Contoh: 4 kg Cuci Kering Lipat @ Rp 7.000 express (×1,5) → Rp 10.500/kg × 4 = **Rp 42.000**,
selesai dalam 24 jam.

---

## 5. Hak akses

| Role | POS | Ubah status | Pelanggan | Layanan & harga | Outlet |
|---|---|---|---|---|---|
| **OWNER** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **MANAJER** | ✅ | ✅ | ✅ | ✅ | hanya lihat |
| **KASIR** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **PRODUKSI** | ❌ | ✅ | ❌ | ❌ | ❌ |

`team_members.outletId` menentukan outlet mana yang boleh diakses. Kosong = semua outlet
(untuk OWNER / MANAJER pusat).

---

## 6. Halaman yang dibangun

| Route | Isi |
|---|---|
| `/dashboard/pos` | Kasir: pilih pelanggan + outlet → tambah item → hitung otomatis → simpan + DP |
| `/dashboard/pesanan` | Daftar pesanan, filter status, cari nomor nota / nama pelanggan |
| `/dashboard/pesanan/[id]` | Detail: item, riwayat status, pembayaran, tombol ubah status |
| `/dashboard/pesanan/[id]/nota` | Nota siap cetak, lebar thermal 58 mm & 80 mm |
| `/dashboard/pelanggan` | CRUD pelanggan |
| `/dashboard/layanan` | CRUD layanan & harga (OWNER / MANAJER) |
| `/dashboard/outlet` | CRUD outlet (OWNER) |

---

## 7. Standar UI (dari skill app-builder)

- Label Bahasa Indonesia; istilah baku tetap Inggris (Dashboard, Express, Total)
- Format `Rp 42.000` tanpa desimal · tanggal `25 Agu 2026` · jam WIB
- **Semua dropdown pakai `SearchableSelect`** — tanpa syarat jumlah opsi
- Light + dark mode, default ikut OS, ada toggle, ada script anti-FOUC
- Kontras WCAG AA — tidak ada `text-gray-400` di atas background terang
- Ada empty state, loading state, dan pesan error di setiap form
- Dicek di lebar 375px (kasir pakai HP)

---

## 8. Di luar cakupan Fase 1

Notifikasi WhatsApp · payment gateway (Xendit/Midtrans) · antar-jemput · laporan &
laba rugi · absensi karyawan · stok · loyalty/voucher · tracking publik · PWA offline ·
reset password & email · ganti Stripe untuk langganan SaaS.

Stripe bawaan starter **dibiarkan apa adanya** di Fase 1 — akan dicabut di Fase 3.
