# QRIS Dinamis

Aplikasi web modern berbasis **Next.js** untuk mengubah kode QRIS Statis menjadi QRIS Dinamis dengan menyisipkan nominal tagihan tertentu. Dilengkapi dengan fitur pemindai kamera (scan), *upload* gambar, dan penambahan logo kustom dengan antarmuka bergaya *Glassmorphism*.

![Glassmorphism Design](public/favicon.png) <!-- Ganti dengan screenshot aplikasi jika ada -->

## ✨ Fitur Utama

- **Kamera Scanner & Upload:** Pindai kode QRIS secara langsung menggunakan kamera (via `html5-qrcode`) atau unggah file gambar QRIS Statis Anda (via `jsQR`).
- **Konversi Dinamis (Server-Side):** Memproses payload string QRIS Statis (tag `0111`), menyisipkan tag nominal (`54`), dan menghitung ulang **CRC16 Checksum** secara akurat melalui API Route `/api/convert`.
- **Injeksi Logo Kustom:** Tambahkan logo merek/toko Anda di tengah QR Code. Rasio aspek gambar akan dipertahankan secara otomatis tanpa mengubah struktur QR secara destruktif.
- **Format Rupiah Otomatis:** Input nominal didukung dengan *delimiter* pemisah ribuan standar Indonesia.
- **Validasi Kemanan:** Pembatasan ukuran file maksimal 1MB untuk logo guna mencegah *crash* di sisi klien, dan *error handling* jika gambar gagal dipindai.
- **Desain Premium:** Antarmuka *Glassmorphism* elegan, warna *dark mode* neon (Zinc + Cyan), dan animasi *micro-interactions* menggunakan Tailwind CSS & shadcn/ui.

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & Vanilla CSS
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **QR Code Parser:** [jsQR](https://github.com/cozmo/jsQR) (Image File) & [html5-qrcode](https://github.com/mebjas/html5-qrcode) (Camera Live Scan)
- **QR Code Generator:** [qrcode.react](https://github.com/zpao/qrcode.react)

## 🚀 Cara Menjalankan Secara Lokal

Pastikan Anda telah menginstal **Node.js** (direkomendasikan menggunakan v22 sesuai inisialisasi awal) dan npm.

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/ahyaniayas/qris-dinamis.git
   cd qris-dinamis
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```

4. **Buka di Browser:**
   Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

## ⚠️ Disclaimer

Aplikasi ini dibuat murni sebagai **Alat Bantu Otomasi Matematis** untuk memodifikasi struktur payload dari QRIS Statis secara spesifik.
1. **100% Berjalan Lokal (Client-API):** Tidak ada data transaksi, riwayat payload, maupun gambar yang disimpan di database server manapun. Semua pemrosesan bersifat *stateless*.
2. **Risiko Logo:** Penambahan logo di tengah QRIS dapat menurunkan tingkat keterbacaan (scannability) pada kamera aplikasi *Mobile Banking* tertentu.
3. **Uji Coba Wajib:** Selalu tes _scan_ QRIS Dinamis Anda dengan nominal kecil sebelum digunakan untuk transaksi dengan nominal sesungguhnya.
4. **Pelepasan Tanggung Jawab:** Pengembang proyek ini tidak berafiliasi dengan PT. Jalin, ASPI, maupun bank penyelenggara mana pun, serta **tidak bertanggung jawab** atas kerugian finansial, kegagalan transaksi, ataupun kesalahan transfer yang timbul akibat kelalaian operasi pengguna.

## 📄 Lisensi

Diistribusikan di bawah Lisensi MIT. Silakan lihat `LICENSE` untuk informasi lebih lanjut.
