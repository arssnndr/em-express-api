# em-express-api

Express API (ESM) untuk Employee Management, menggunakan Supabase sebagai backend database.

## Fitur
- Auth: `POST /api/auth/login`
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
- `PORT` (opsional untuk lokal)

## Integrasi Frontend
Frontend Angular mengarah ke base URL API melalui environment:
- Dev: `http://localhost:3000/api`
- Prod: `https://<host>/api`

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
