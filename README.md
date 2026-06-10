# Presensi PPA Delada

Aplikasi Manajemen Absensi Siswa PPA dengan fitur Superadmin dan Mentor Portal. Dibangun dengan teknologi web modern untuk performa tinggi dan tampilan yang responsif baik di desktop maupun perangkat seluler.

## 🚀 Fitur Utama

- **Sistem Autentikasi Ganda (JWT):** Login terpisah yang aman untuk peran `SUPERADMIN` dan `MENTOR`.
- **Dashboard Superadmin:** Mengelola mentor, mendaftarkan siswa baru, melihat statistik secara realtime, dan mengekspor laporan absensi.
- **Portal Mentor:** Tampilan khusus (*mobile-friendly*) bagi mentor untuk melakukan checklist absensi siswa (Hadir, Izin, Sakit, Alpa) setiap harinya.
- **Responsive & Mobile-First:** Dirancang khusus untuk terlihat indah dan mencegah bug geser layar (overscroll) layaknya aplikasi *Native* saat dibuka melalui HP (iPhone/Android).
- **Keamanan Tinggi:** Seluruh password di-hash secara otomatis menggunakan enkripsi `bcryptjs`.

## 🛠️ Teknologi yang Digunakan

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Provider:** PostgreSQL (Supabase)
- **Autentikasi:** JWT (`jose`) & Hash (`bcryptjs`)

## 💻 Panduan Instalasi Lokal

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/LindungiLw/presensi_ppa.git
   cd presensi_ppa
   ```

2. **Install semua dependensi:**
   ```bash
   npm install
   ```

3. **Buat file `.env` di dalam folder utama dan isi dengan variabel berikut:**
   ```env
   # Ganti dengan URL PostgreSQL Supabase Anda
   DATABASE_URL="postgres://username:password@aws-0-xyz.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgres://username:password@aws-0-xyz.pooler.supabase.com:5432/postgres"

   # JWT dan Akun Default
   JWT_SECRET="rahasia_acak_ppa_delada_2024_secure"
   SUPERADMIN_EMAIL="superadmin@ppa.com"
   SUPERADMIN_PASSWORD="password_rahasia_anda"
   ```

4. **Lakukan sinkronisasi database (Prisma):**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Buat akun Superadmin pertama kali:**
   ```bash
   npx prisma db seed
   ```

6. **Jalankan aplikasi di mode lokal:**
   ```bash
   npm run dev
   ```
   Aplikasi dapat diakses melalui `http://localhost:3000`.

## 🌍 Panduan Deploy ke Vercel

1. Buat akun atau Login ke [Vercel](https://vercel.com/).
2. Tambahkan proyek baru (Add New Project) dan impor repository GitHub Anda (`presensi_ppa`).
3. Pada halaman konfigurasi sebelum deploy, masuk ke menu **Environment Variables**.
4. Masukkan **semua** variabel yang ada di file `.env` secara manual:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SUPERADMIN_EMAIL`
   - `SUPERADMIN_PASSWORD`
5. Klik **Deploy**. Vercel akan secara otomatis membangun situs dan merilis aplikasi absensi Anda secara online!

## 👥 Alur Kerja (Workflow)
- **Hak Akses Superadmin:** Punya kendali penuh untuk membuat/mereset password akun Mentor dan meregistrasikan Siswa baru ke mentor tertentu.
- **Hak Akses Mentor:** Saat mentor login, mereka hanya akan disuguhkan daftar siswa yang di bawah naungan mereka untuk mempermudah checklist absensi harian.

---
*Dikembangkan dengan ❤️ untuk PPA Delada IO-126*
