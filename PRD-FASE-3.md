# PRD — LaundryKu Fase 3

**Tujuan Fase 3:** membuat aplikasi ini bisa **dijual**. Sampai Fase 2 ia sudah berguna
untuk satu laundry; sekarang ia harus bisa menerima banyak laundry, membatasi mereka sesuai
paket, dan menerima uang langganan dalam Rupiah.

**Definisi selesai Fase 3:**
1. Pemilik laundry baru bisa daftar dan langsung siap berjualan tanpa dibantu.
2. Paket punya batas yang benar-benar ditegakkan, bukan sekadar tulisan di halaman harga.
3. Pembayaran langganan lewat gateway Indonesia, bukan Stripe.

Lanjutan dari [PRD-FASE-1.md](PRD-FASE-1.md) dan [PRD-FASE-2.md](PRD-FASE-2.md).

---

## 1. Keputusan yang diambil

| Hal | Keputusan | Alasan |
|---|---|---|
| Stripe | **Dicabut seluruhnya** | Tidak melayani merchant Indonesia untuk kasus ini, dan tidak punya QRIS/VA/e-wallet. Membiarkannya menempel hanya menyisakan kode mati yang menyesatkan. |
| Gateway | **Adapter**, default `simulasi`; dukung `xendit` dan `midtrans` | Pola yang sama dengan WhatsApp di Fase 2 dan alasannya sama: bisa dibangun dan diuji tanpa kredensial, ganti provider tanpa menyentuh kode fitur. |
| Model tagihan | **Invoice sekali bayar per siklus**, bukan auto-debit berulang | Recurring butuh kartu tersimpan; UMKM Indonesia mayoritas bayar lewat QRIS/VA/transfer. Invoice per periode adalah pola yang mereka kenal. |
| Kredensial | Dari **environment**, bukan database | Sama seperti Fase 2 — kunci rahasia tidak boleh ikut terbawa setiap backup. |
| Batas paket | Ditegakkan di **server action**, bukan hanya disembunyikan di UI | Menyembunyikan tombol bukan pembatasan. Siapa pun bisa memanggil action langsung. |
| Nomor nota saat limit habis | Pesanan **ditolak sebelum nomor dibuat** | Supaya tidak ada lompatan nomor nota yang membingungkan saat audit. |

---

## 2. Paket

| Paket | Harga / bulan | Outlet | Pengguna | Pesanan / bulan |
|---|---|---|---|---|
| **Gratis** | Rp 0 | 1 | 2 | 50 |
| **Pro** | Rp 99.000 | 3 | 10 | 1.000 |
| **Bisnis** | Rp 249.000 | tak terbatas | tak terbatas | tak terbatas |

Siklus tahunan dibayar 10 bulan (dua bulan gratis).
`NULL` pada kolom batas berarti **tak terbatas** — bukan nol.

Tenant baru mendapat **uji coba Pro 14 hari**. Setelah habis, otomatis turun ke Gratis;
data tidak dihapus, hanya batasnya mengetat.

> Kenapa turun ke Gratis, bukan dikunci: laundry yang lupa memperpanjang tetap harus bisa
> melihat data pelanggannya. Mengunci total membuat mereka kehilangan bisnis, dan kita
> kehilangan mereka.

---

## 3. Entitas baru

### `plans`
`kode` (unik) · `nama` · `hargaBulanan` · `hargaTahunan` · `maxOutlet` · `maxPengguna` ·
`maxPesananPerBulan` · `urutan` · `aktif`

### `subscriptions` — satu baris per tenant
| Field | Catatan |
|---|---|
| teamId | unik |
| planId | paket yang berlaku sekarang |
| status | `TRIAL` \| `AKTIF` \| `KEDALUWARSA` |
| siklus | `BULANAN` \| `TAHUNAN` |
| berakhirPada | kapan periode berjalan habis; `NULL` untuk paket Gratis yang tidak kedaluwarsa |

### `invoices`
`nomorInvoice` (unik per tenant) · `planId` · `siklus` · `jumlah` · `status`
(`MENUNGGU` \| `DIBAYAR` \| `KEDALUWARSA` \| `BATAL`) · `provider` · `providerRef` ·
`urlBayar` · `dibayarPada` · `kedaluwarsaPada`

Kolom Stripe di tabel `teams` (`stripe_customer_id`, `stripe_subscription_id`,
`stripe_product_id`, `plan_name`, `subscription_status`) **dihapus** — semuanya kosong dan
sudah tidak dipakai.

---

## 4. Alur pembayaran

```
Pilih paket → invoice dibuat (status MENUNGGU) → pengguna dibawa ke halaman bayar provider
                                                            ↓
                                            webhook masuk saat pembayaran beres
                                                            ↓
                        invoice DIBAYAR + langganan diperpanjang / dinaikkan paketnya
```

- Webhook **wajib diverifikasi**: Xendit lewat header `x-callback-token`, Midtrans lewat
  `signature_key` SHA-512. Tanpa verifikasi, siapa pun yang tahu URL-nya bisa menaikkan
  paketnya sendiri secara gratis.
- Webhook harus **idempoten**: provider mengirim ulang kalau tidak dapat balasan 200.
  Invoice yang sudah `DIBAYAR` tidak diproses dua kali.
- Perpanjangan dihitung dari **`berakhirPada` yang masih berlaku**, bukan dari hari ini —
  supaya membayar lebih awal tidak menghanguskan sisa masa aktif.

### Mode simulasi
Tanpa kredensial, `urlBayar` mengarah ke halaman internal berisi tombol
**"Tandai Lunas (Simulasi)"**. Alur upgrade jadi bisa diuji utuh secara lokal tanpa uang
sungguhan dan tanpa akun provider.

---

## 5. Penegakan batas

| Tindakan | Diblokir kalau |
|---|---|
| Tambah outlet | jumlah outlet aktif ≥ `maxOutlet` |
| Undang anggota | jumlah anggota + undangan tertunda ≥ `maxPengguna` |
| Simpan pesanan di POS | pesanan bulan berjalan ≥ `maxPesananPerBulan` |

Pesan penolakan harus menyebut **paket sekarang, angka batasnya, dan cara naik paket** —
bukan sekadar "limit tercapai".

Yang **tidak** dibatasi: membaca data, mencetak nota lama, mengubah status pesanan yang
sudah ada. Batas berlaku untuk pertumbuhan, bukan untuk mengakses apa yang sudah dibayar.

---

## 6. Onboarding — `/dashboard/mulai`

Tenant yang belum punya outlet diarahkan ke sini secara otomatis.

1. **Outlet pertama** — nama, kode nota, alamat, telepon
2. **Layanan awal** — pilih dari daftar bawaan (cuci kering lipat, setrika, bed cover, dll),
   bisa dicentang sebagian; harga bisa disesuaikan nanti di menu Layanan
3. **Selesai** — langsung diarahkan ke POS

Alasan langkah 2 memakai preset: laundry baru tidak tahu harus mengisi apa, dan halaman
Layanan yang kosong membuat POS tidak bisa dipakai sama sekali.

---

## 7. Di luar cakupan Fase 3

Panel super-admin (lihat semua tenant, suspend, MRR) · nomor WhatsApp per tenant ·
antar-jemput & kurir · laporan laba rugi · absensi · stok · loyalty · tracking publik ·
PWA offline · reset password & email · faktur pajak / PPN.
