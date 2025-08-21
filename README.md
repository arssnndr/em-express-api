# em-express-api

Express API (ESM) untuk Employee Management, menggunakan Supabase sebagai backend database.

## Fitur
- Auth: `POST /api/auth/login`, `POST /api/auth/register`, `POST /api/auth/logout`
- Employees: `GET /api/employees`, `GET /api/employees/:id`, `POST /api/employees`, `DELETE /api/employees/:id`
- CORS aktif, response 404 dalam JSON

## Prasyarat
- Node.js 18+
- Akun & Project Supabase (URL dan Anon Key)

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Buat file `.env` dari contoh
   ```bash
   cp .env.example .env
   ```
   Isi variabel berikut:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `JWT_SECRET` (wajib, lihat panduan di bawah)
   - `JWT_EXPIRES_IN` (opsional, default `15m`)
   - `CORS_ORIGIN` (opsional, default `http://localhost:4200`)
   - (Opsional) `PORT` (default 3000 untuk local server)

## Menjalankan Secara Lokal
```bash
npm start
```
- Server berjalan di `http://localhost:3000`
- Endpoint tersedia di path `/api/*` (contoh: `http://localhost:3000/api/employees`)

## Struktur Direktori Penting
- `app.js` — konfigurasi Express (CORS, parser, mounting routes, health check, 404)
- `config/supabase.js` — inisialisasi Supabase Client dari env
- `controllers/` — logic bisnis (auth & employees)
- `routes/` — definisi rute Express

## Environment Variables
Didefinisikan di `.env` (lihat `.env.example`)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET` — secret untuk signing JWT (gunakan string acak yang kuat)
- `JWT_EXPIRES_IN` — masa berlaku token, contoh: `15m`, `1h`
- `CORS_ORIGIN` — daftar origin yang diizinkan, pisahkan dengan koma
- `PORT` (opsional untuk lokal)

### Generate JWT_SECRET (Strong Random String)
Anda dapat membuat nilai `JWT_SECRET` yang kuat dengan salah satu perintah berikut (Linux):

- OpenSSL (hex, 64 chars / 32 bytes)
```bash
openssl rand -hex 32
```

- OpenSSL (base64-url, ±64–86 chars)
```bash
openssl rand -base64 48 | tr '+/' '-_' | tr -d '='
```

- Node.js (hex, 64 chars)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

- Python (hex, 64 chars)
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Contoh menulis langsung ke `.env` (akan menambah baris JWT_SECRET di akhir file):
```bash
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
```

## Integrasi Frontend
Frontend Angular mengarah ke base URL API melalui environment:
- Dev: `http://localhost:3000/api`
- Prod: `https://<host>/api`

## Menjalankan Frontend Angular (Lokal)

Ikuti langkah berikut untuk menjalankan aplikasi frontend di mesin lokal Anda:

1. Clone repository frontend dan masuk ke foldernya
   ```bash
   git clone https://github.com/arssnndr/employee-management.git
   cd employee-management
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Pastikan environment development mengarah ke backend lokal
   - File: `src/environments/environment.development.ts`
   - Nilai default sudah sesuai (tidak perlu diubah):
     ```ts
     export const environment = {
       API_BASE_URL: 'http://localhost:3000/api',
     };
     ```

4. Jalankan frontend
   ```bash
   npm start
   # atau
   ng serve
   ```

5. Buka browser ke
   ```
   http://localhost:4200
   ```

Catatan:
- Pastikan server backend dari repo ini berjalan di `http://localhost:3000` (lihat bagian Menjalankan Secara Lokal di atas).
- Jika Anda mengubah origin frontend, sesuaikan `CORS_ORIGIN` pada `.env` backend (default: `http://localhost:4200`).

## ❗ Troubleshooting

- **ENV belum diisi / server gagal start**
  - Pastikan file `.env` dibuat dari `.env.example` dan semua variabel wajib (SUPABASE_URL, SUPABASE_ANON_KEY, JWT_SECRET) terisi

- **CORS error dari frontend**
  - Set `CORS_ORIGIN` di `.env` agar sesuai origin frontend (contoh: `http://localhost:4200`), pisahkan dengan koma untuk multi-origin

- **Port sudah digunakan**
  - Ubah `PORT` di `.env`, contoh `PORT=3001`, lalu perbarui base URL frontend ke `http://localhost:3001/api`

- **401 Unauthorized / token tidak valid**
  - Regenerasi `JWT_SECRET` dengan string acak kuat
  - Pastikan token tidak kedaluwarsa (`JWT_EXPIRES_IN`), dan waktu sistem tidak menyimpang jauh (NTP)

- **404 untuk endpoint**
  - Selalu akses dengan prefix `/api`, contoh: `GET http://localhost:3000/api/employees`

- **Supabase authentication/data gagal**
  - Verifikasi `SUPABASE_URL` dan `SUPABASE_ANON_KEY` benar dan punya akses ke project
  - Cek policy/tables di Supabase agar operasi SELECT/INSERT/DELETE diizinkan sesuai kebutuhan

## Deploy ke Vercel (Opsional)
Vercel menjalankan Serverless Functions, bukan proses server panjang. Opsi minimal:
1. Tambahkan direktori `api/` dengan handler yang mem-forward ke `app.js`:
   - `api/index.js`
   - `api/[...path].js`
   Contoh isi keduanya:
   ```js
   import app from '../app.js';
   export default app;
   ```
2. Set environment variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) di Project Settings Vercel.
3. Deploy.

Atau gunakan platform seperti Render/Railway/Fly untuk menjalankan Node server standar.
