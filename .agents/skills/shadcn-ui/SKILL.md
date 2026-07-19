---
name: shadcn-ui
description: Skill untuk mengelola komponen shadcn/ui di proyek Next.js, mencakup cara menambah komponen, styling, dan struktur direktori.
---

# Shadcn UI Customization Skill

Skill ini memberikan instruksi tentang cara menambahkan dan menggunakan komponen **shadcn/ui** di dalam workspace ini.

## Aturan Penggunaan
1. **Instalasi Komponen:**
   Saat diminta untuk menggunakan komponen shadcn/ui (misal: Button, Card, Dialog), selalu jalankan perintah berikut menggunakan terminal:
   ```bash
   npx shadcn@latest add <nama-komponen>
   ```
   Contoh: `npx shadcn@latest add button`

2. **Lokasi Komponen:**
   Secara default, instalasi shadcn di proyek ini menyimpan komponen di dalam direktori `components/ui`. Gunakan path alias saat mengimpor komponen:
   ```typescript
   import { Button } from "@/components/ui/button";
   import { Card } from "@/components/ui/card";
   ```

3. **Styling dan Tema:**
   Proyek ini menggunakan perpaduan **Tailwind CSS** dan kustom **Vanilla CSS (Glassmorphism)**. 
   - Anda diperbolehkan memodifikasi file komponen di `components/ui/*` menggunakan utilitas Tailwind.
   - Hindari menghapus atau menimpa variabel `--bg-gradient-1` dan `--glass-bg` yang berada di `app/globals.css`, karena itu akan merusak tema dasar aplikasi.

4. **Ketergantungan Ikon:**
   Proyek ini telah menggunakan `lucide-react` sebagai library ikon bawaan shadcn/ui. Anda bebas mengimpor ikon dari sana:
   ```typescript
   import { CheckCircle2, Download } from "lucide-react";
   ```

## Workflow Umum
- Jika fitur baru butuh komponen UI yang elegan, pastikan terlebih dahulu apakah komponen shadcn (misal `Input`, `Select`, `Dialog`) relevan dan belum diinstal.
- Jika belum diinstal, jalankan perintah CLI untuk menginstalnya sebelum mencoba menggunakan `import`.
- Modifikasi komponen menggunakan Tailwind jika dibutuhkan untuk menyesuaikan dengan tema aplikasi.
