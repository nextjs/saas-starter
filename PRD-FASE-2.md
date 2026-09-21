# PRD — LaundryKu Fase 2

**Tujuan Fase 2:** membuat aplikasi ini dipakai *setiap hari*, bukan cuma saat mencatat nota.
Tiga hal yang menahan orang pindah dari buku tulis ke aplikasi: karyawan produksi butuh papan
kerja, pelanggan butuh dikabari, dan pemilik butuh tahu omzetnya.

**Definisi selesai Fase 2:**
1. Karyawan produksi bisa membuka satu layar berisi semua cucian yang sedang dikerjakan,
   dan memajukan statusnya tanpa membuka nota satu per satu.
2. Saat cucian ditandai siap diambil, pelanggan otomatis dapat WhatsApp.
3. Pemilik bisa melihat omzet, piutang, dan layanan terlaris untuk periode yang dipilih.

Lanjutan dari [PRD-FASE-1.md](PRD-FASE-1.md). Aturan hitung, status, dan RBAC di sana tetap berlaku.

---

## 1. Keputusan yang diambil

| Hal | Keputusan | Alasan |
|---|---|---|
| Provider WA | **Adapter**, default `simulasi`; dukung `fonnte` dan `wablas` | Fonnte/Wablas jauh lebih murah dan cepat dipasang untuk UMKM daripada Meta WA Business API yang perlu verifikasi bisnis. Adapter supaya ganti provider tidak menyentuh kode fitur. |
| Kredensial WA | Dari **environment variable**, bukan tabel database | Token adalah rahasia. Menyimpannya di DB berarti setiap query dan setiap backup ikut membawanya. Konsekuensinya: satu nomor pengirim untuk seluruh platform — WA per-tenant masuk Fase 3. |
| Tanpa kredensial | Mode **simulasi**: pesan tetap dirender & dicatat, tapi tidak dikirim | Supaya fitur bisa dikembangkan, diuji, dan didemokan tanpa biaya dan tanpa mengirim WA ke nomor orang sungguhan. |
| Isi pesan | Template **per tenant, di database** | Ini bukan rahasia, dan tiap pemilik ingin gaya bahasanya sendiri. |
| Papan antrian | Tombol maju/mundur, **bukan drag-and-drop** | Dipakai di HP dengan tangan basah. Drag di layar sentuh kecil lebih sering meleset daripada membantu. |
| Angka laporan | Dihitung dari `orders.total` dan `payments.jumlah` **di query terpisah** | Menggabung `order_items` dan `payments` dalam satu JOIN melipatgandakan baris dan menggelembungkan omzet. |

---

## 2. Entitas baru

### `notification_settings` — satu baris per tenant
| Field | Catatan |
|---|---|
| teamId | unik |
| aktifSiapAmbil | boolean, default true — kirim saat status jadi `SIAP_AMBIL` |
| aktifPesananMasuk | boolean, default false — kirim struk digital saat nota dibuat |
| templateSiapAmbil | text, ada nilai bawaan |
| templatePesananMasuk | text |

### `notifications` — log setiap percobaan kirim
| Field | Catatan |
|---|---|
| teamId, orderId | orderId boleh null (untuk tes kirim) |
| jenis | `SIAP_AMBIL` \| `PESANAN_MASUK` \| `TES` |
| tujuan | nomor tujuan, sudah dinormalisasi ke format 62 |
| pesan | isi final setelah template dirender — disimpan apa adanya |
| status | `TERKIRIM` \| `GAGAL` \| `SIMULASI` |
| provider | `fonnte` \| `wablas` \| `simulasi` |
| referensi | id pesan dari provider, kalau ada |
| galat | pesan error kalau gagal |

> Kenapa isi pesan disimpan penuh: kalau pemilik mengubah template bulan depan, log lama
> harus tetap menunjukkan apa yang benar-benar diterima pelanggan.

---

## 3. Template pesan

Variabel yang tersedia: `{nama}` `{nota}` `{outlet}` `{total}` `{sisa}` `{item}` `{estimasi}` `{telepon_outlet}`

Bawaan `templateSiapAmbil`:

```
Halo {nama}, cucian Anda dengan nota {nota} sudah selesai dan siap diambil.

Rincian: {item}
Sisa tagihan: {sisa}

Terima kasih sudah mempercayakan cucian Anda ke {outlet}.
```

Variabel yang tidak dikenal dibiarkan apa adanya, tidak dihapus — supaya salah ketik terlihat
oleh pemilik saat mengetes, bukan diam-diam hilang di pesan pelanggan.

---

## 4. Aturan pengiriman

- Dikirim **hanya saat transisi** ke `SIAP_AMBIL`. Menekan tombol status yang sama dua kali
  tidak mengirim ulang.
- Kegagalan kirim **tidak membatalkan perubahan status**. Cucian tetap siap diambil walaupun
  WhatsApp sedang bermasalah; kegagalannya dicatat dan bisa dikirim ulang manual.
- Nomor dinormalisasi: `08123…` → `628123…`, `+62 812-3…` → `62812…`.
- Ada tombol **kirim ulang manual** di detail pesanan untuk kasus gagal atau pelanggan minta
  dikirim lagi.

---

## 5. Papan antrian — `/dashboard/antrian`

Kolom: `BARU` → `PROSES_CUCI` → `PROSES_KERING` → `PROSES_SETRIKA` → `SIAP_AMBIL`.
`SELESAI` dan `BATAL` tidak ditampilkan — papan ini untuk pekerjaan yang masih berjalan.

Tiap kartu: nomor nota, nama pelanggan, ringkasan item, estimasi selesai, penanda **Terlambat**
kalau `estimasiSelesai` sudah lewat dan status belum `SIAP_AMBIL`.

Hak akses sama dengan ubah status di Fase 1: OWNER, MANAJER, KASIR, PRODUKSI.
Anggota yang ditugaskan ke satu outlet hanya melihat outletnya.

---

## 6. Laporan — `/dashboard/laporan`

Filter: periode (Hari ini / 7 hari / Bulan ini / rentang bebas) dan outlet.

| Blok | Isi |
|---|---|
| Ringkasan | Omzet, jumlah nota, rata-rata per nota, sudah dibayar, piutang |
| Layanan terlaris | Nama, jumlah transaksi, total qty, omzet |
| Per outlet | Jumlah nota dan omzet |
| Performa kasir | Siapa membuat berapa nota, senilai berapa |
| Status berjalan | Berapa nota di tiap status |

**Definisi omzet:** jumlah `orders.total` untuk pesanan yang **tidak** berstatus `BATAL`,
dihitung berdasarkan `tanggalMasuk`. Bukan berdasarkan pembayaran — laundry lazim menerima
uang belakangan, dan pemilik ingin tahu nilai pekerjaan yang masuk hari itu.

**Piutang** = omzet − total pembayaran yang tercatat untuk pesanan-pesanan tersebut.

Hak akses: **OWNER dan MANAJER**. Kasir dan produksi tidak melihat laporan uang.

---

## 7. Di luar cakupan Fase 2

Payment gateway (Xendit/Midtrans) · antar-jemput & kurir · nomor WA per tenant ·
pesan terjadwal / pengingat cucian menumpuk · laporan laba rugi (butuh tabel pengeluaran) ·
absensi & performa karyawan produksi · stok · loyalty · tracking publik · PWA offline ·
reset password & email.
