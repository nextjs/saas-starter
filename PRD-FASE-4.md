# PRD — LaundryKu Fase 4

**Tujuan Fase 4:** menutup dua lubang di fondasi yang sekarang **benar-benar rusak**, bukan
sekadar belum ada. Berbeda dari fase sebelumnya yang menambah kemampuan, fase ini
memperbaiki hal yang sudah terlanjur berjalan salah:

1. **Undangan anggota tidak pernah sampai.** `inviteTeamMember` menyimpan satu baris di
   tabel `invitations`, menampilkan "Invitation sent successfully", lalu berhenti. Tidak
   ada email yang dikirim. Orang yang diundang tidak pernah tahu, dan pemilik mengira
   sudah terkirim.
2. **Lupa password berarti terkunci selamanya.** Tidak ada satu pun jalur pemulihan di
   seluruh aplikasi. Untuk kasir yang lupa passwordnya, satu-satunya jalan sekarang adalah
   mengubah baris database secara manual.

Keduanya menyalahi janji yang sudah ditampilkan aplikasi ke penggunanya. Itu sebabnya
didahulukan dibanding fitur baru seperti antar-jemput atau panel super-admin.

**Definisi selesai Fase 4:**
- Orang yang diundang menerima email berisi tautan, dan bisa bergabung lewat tautan itu.
- Pengguna yang lupa password bisa memulihkannya sendiri, tanpa menyentuh database.

---

## 1. Keputusan yang diambil

| Hal | Keputusan | Alasan |
|---|---|---|
| Pengirim email | **Adapter**, default `simulasi`; dukung `resend` dan `smtp` | Pola yang sama dengan WhatsApp (Fase 2) dan penagihan (Fase 3). Bisa dibangun dan diuji tanpa kredensial, ganti penyedia tanpa menyentuh kode fitur. |
| Kredensial | Dari **environment** | Sama seperti dua fase sebelumnya — kunci rahasia tidak ikut terbawa backup database. |
| Token reset | Disimpan sebagai **hash**, bukan teks asli | Tabel token sama sensitifnya dengan tabel password. Kalau database bocor, token mentah bisa langsung dipakai mengambil alih akun. |
| Balasan "lupa password" | **Selalu sama**, terdaftar atau tidak | Kalau balasannya berbeda, halaman itu berubah jadi alat memeriksa email siapa saja yang punya akun di sini. |
| Masa berlaku token | **1 jam**, sekali pakai | Cukup untuk membuka email, terlalu pendek untuk disalahgunakan dari riwayat browser bersama. |
| Kegagalan kirim email | Dicatat, **tidak membatalkan aksinya** | Undangan tetap tersimpan walau email gagal — pemilik bisa mengirim ulang tanpa mengulang dari awal. |

---

## 2. Entitas baru

### `password_reset_tokens`
| Field | Catatan |
|---|---|
| userId | pemilik token |
| tokenHash | SHA-256 dari token asli; token aslinya hanya pernah ada di email |
| kedaluwarsaPada | 1 jam sejak dibuat |
| dipakaiPada | terisi saat token ditukar; token bekas tidak bisa dipakai lagi |

### `email_log`
Jejak setiap percobaan kirim, sejajar dengan tabel `notifications` di Fase 2.
`tujuan` · `jenis` (`UNDANGAN` \| `RESET_PASSWORD`) · `subjek` · `isi` · `status`
(`TERKIRIM` \| `GAGAL` \| `SIMULASI`) · `provider` · `galat`

> **Isi email disimpan penuh, tapi token reset TIDAK.** Yang tercatat di log adalah versi
> yang tautannya sudah disamarkan. Kalau tidak, log berubah jadi daftar kunci cadangan
> untuk setiap akun.

---

## 3. Alur undangan

```
Owner mengundang → baris invitations dibuat → email berisi tautan dikirim
                                                        ↓
                        /sign-up?inviteId=N&email=...  (alur ini sudah ada sejak awal)
                                                        ↓
                        akun dibuat, bergabung ke tim, undangan jadi "accepted"
```

Yang ditambahkan Fase 4 hanya pengirimannya — logika menerima undangan sudah ada di
`signUp` dan tidak diubah.

Ditambahkan juga:
- **Daftar undangan tertunda** di halaman Tim, supaya pemilik tahu siapa yang sudah
  diundang tapi belum bergabung. Sekarang informasi itu tidak terlihat sama sekali.
- **Kirim ulang** dan **batalkan** undangan.

Membatalkan undangan penting karena undangan tertunda ikut memakan kuota pengguna
(Fase 3 §5) — tanpa tombol batal, kuota bisa tersandera undangan yang salah ketik.

---

## 4. Alur reset password

```
/lupa-password → masukkan email → SELALU balas "kalau terdaftar, tautan sudah dikirim"
                                                        ↓
                                    email berisi /reset-password/<token>
                                                        ↓
                          token diverifikasi → password baru → token ditandai terpakai
```

Aturan:
- Token lama milik pengguna yang sama **dibatalkan** saat token baru dibuat, supaya tidak
  ada dua kunci berlaku bersamaan.
- Permintaan dibatasi **3 kali per email per jam**. Tanpa batas ini, halaman itu bisa
  dipakai membanjiri kotak masuk orang lain.
- Password baru mengikuti aturan yang sama dengan pendaftaran (minimal 8 karakter).

---

## 5. Di luar cakupan Fase 4

Verifikasi alamat email saat pendaftaran · panel super-admin · nomor WhatsApp per tenant ·
antar-jemput & kurir · laporan laba rugi · absensi · stok · loyalty · tracking publik ·
PWA offline · faktur PPN.
