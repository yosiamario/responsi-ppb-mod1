# 📚 API Perpustakaan — Layanan Pencatatan Peminjaman Buku

REST API sederhana untuk layanan pencatatan peminjaman buku perpustakaan. Dibangun menggunakan **Node.js**, **Express.js**, dan **Supabase** sebagai database, serta di-deploy ke **Vercel**.

## 🎯 Deskripsi & Tujuan

Proyek ini menyediakan REST API untuk mengelola data perpustakaan, meliputi:

- **Manajemen Anggota** — CRUD data anggota perpustakaan
- **Manajemen Buku** — CRUD data koleksi buku
- **Pencatatan Peminjaman** — CRUD data peminjaman buku oleh anggota, termasuk fitur pengembalian buku dan manajemen stok otomatis
- **Filter Query** — Filter data peminjaman berdasarkan status (`Dipinjam`, `Dikembalikan`, `Terlambat`), `anggota_id`, atau `buku_id`

## 🔗 Link Deployment

> **Base URL Vercel**: `https://perpustakaan-api-xxxxx.vercel.app`
>
> _(Ganti dengan URL deployment Anda yang sebenarnya)_

---

## 📁 Struktur Proyek

```
perpustakaan-api/
├── api/
│   └── index.js              # Entry point Express (Vercel serverless)
├── src/
│   ├── config/
│   │   └── supabase.js       # Konfigurasi Supabase client
│   ├── routes/
│   │   ├── anggota.js        # Routes CRUD anggota
│   │   ├── buku.js           # Routes CRUD buku
│   │   └── peminjaman.js     # Routes CRUD peminjaman
│   └── middleware/
│       └── errorHandler.js   # Middleware error handling
├── supabase-schema.sql       # SQL schema untuk Supabase
├── vercel.json               # Konfigurasi deployment Vercel
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗄️ Struktur Data / Schema

### Tabel `anggota`

| Kolom        | Tipe         | Keterangan                  |
| ------------ | ------------ | --------------------------- |
| `id`         | UUID         | Primary Key (auto-generate) |
| `nama`       | VARCHAR(255) | Nama anggota (**wajib**)    |
| `email`      | VARCHAR(255) | Email unik (**wajib**)      |
| `no_telepon` | VARCHAR(20)  | Nomor telepon               |
| `alamat`     | TEXT         | Alamat                      |
| `created_at` | TIMESTAMPTZ  | Waktu dibuat (otomatis)     |

### Tabel `buku`

| Kolom          | Tipe         | Keterangan                  |
| -------------- | ------------ | --------------------------- |
| `id`           | UUID         | Primary Key (auto-generate) |
| `judul`        | VARCHAR(500) | Judul buku (**wajib**)      |
| `pengarang`    | VARCHAR(255) | Nama pengarang (**wajib**)  |
| `penerbit`     | VARCHAR(255) | Nama penerbit               |
| `tahun_terbit` | INTEGER      | Tahun terbit                |
| `isbn`         | VARCHAR(20)  | Nomor ISBN                  |
| `stok`         | INTEGER      | Jumlah stok (default: 1)    |
| `created_at`   | TIMESTAMPTZ  | Waktu dibuat (otomatis)     |

### Tabel `peminjaman`

| Kolom                  | Tipe        | Keterangan                                        |
| ---------------------- | ----------- | ------------------------------------------------- |
| `id`                   | UUID        | Primary Key (auto-generate)                       |
| `anggota_id`           | UUID        | Foreign Key → `anggota.id` (**wajib**)            |
| `buku_id`              | UUID        | Foreign Key → `buku.id` (**wajib**)               |
| `tanggal_pinjam`       | DATE        | Tanggal peminjaman (**wajib**)                    |
| `tanggal_kembali`      | DATE        | Batas tanggal pengembalian (**wajib**)            |
| `tanggal_dikembalikan` | DATE        | Tanggal buku dikembalikan (diisi saat kembali)    |
| `status`               | VARCHAR(20) | `Dipinjam` \| `Dikembalikan` \| `Terlambat`      |
| `created_at`           | TIMESTAMPTZ | Waktu dibuat (otomatis)                           |

### Relasi Antar Tabel

```
anggota (1) ──── (N) peminjaman (N) ──── (1) buku
```

---

## 📡 Daftar Endpoint

### Root

| Method | Endpoint | Deskripsi                |
| ------ | -------- | ------------------------ |
| GET    | `/`      | Informasi API & endpoint |

### Anggota

| Method | Endpoint        | Deskripsi                       |
| ------ | --------------- | ------------------------------- |
| GET    | `/anggota`      | Ambil semua anggota             |
| GET    | `/anggota/:id`  | Ambil anggota berdasarkan ID    |
| POST   | `/anggota`      | Tambah anggota baru             |
| PUT    | `/anggota/:id`  | Update data anggota             |
| DELETE | `/anggota/:id`  | Hapus anggota                   |

**Query Parameter**: `?nama=xxx`, `?email=xxx`

### Buku

| Method | Endpoint    | Deskripsi                   |
| ------ | ----------- | --------------------------- |
| GET    | `/buku`     | Ambil semua buku            |
| GET    | `/buku/:id` | Ambil buku berdasarkan ID   |
| POST   | `/buku`     | Tambah buku baru            |
| PUT    | `/buku/:id` | Update data buku            |
| DELETE | `/buku/:id` | Hapus buku                  |

**Query Parameter**: `?judul=xxx`, `?pengarang=xxx`, `?isbn=xxx`

### Peminjaman

| Method | Endpoint                       | Deskripsi               |
| ------ | ------------------------------ | ----------------------- |
| GET    | `/peminjaman`                  | Ambil semua peminjaman  |
| GET    | `/peminjaman/:id`              | Ambil detail peminjaman |
| POST   | `/peminjaman`                  | Buat peminjaman baru    |
| PUT    | `/peminjaman/:id`              | Update data peminjaman  |
| PUT    | `/peminjaman/:id/kembalikan`   | Kembalikan buku         |
| DELETE | `/peminjaman/:id`              | Hapus data peminjaman   |

**Query Parameter**: `?status=Dipinjam`, `?status=Dikembalikan`, `?status=Terlambat`, `?anggota_id=xxx`, `?buku_id=xxx`

---

## 📝 Contoh Request & Response

### 1. Tambah Anggota Baru

**Request:**

```http
POST /anggota
Content-Type: application/json

{
  "nama": "Budi Santoso",
  "email": "budi@email.com",
  "no_telepon": "081234567890",
  "alamat": "Jl. Merdeka No. 10, Jakarta"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Anggota berhasil ditambahkan",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "nama": "Budi Santoso",
    "email": "budi@email.com",
    "no_telepon": "081234567890",
    "alamat": "Jl. Merdeka No. 10, Jakarta",
    "created_at": "2026-10-10T13:00:00.000Z"
  }
}
```

### 2. Tambah Buku Baru

**Request:**

```http
POST /buku
Content-Type: application/json

{
  "judul": "Laskar Pelangi",
  "pengarang": "Andrea Hirata",
  "penerbit": "Bentang Pustaka",
  "tahun_terbit": 2005,
  "isbn": "978-979-1227-00-2",
  "stok": 5
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Buku berhasil ditambahkan",
  "data": {
    "id": "b1c2d3e4-f5a6-7890-bcde-fa1234567890",
    "judul": "Laskar Pelangi",
    "pengarang": "Andrea Hirata",
    "penerbit": "Bentang Pustaka",
    "tahun_terbit": 2005,
    "isbn": "978-979-1227-00-2",
    "stok": 5,
    "created_at": "2026-10-10T13:00:00.000Z"
  }
}
```

### 3. Buat Peminjaman Baru

**Request:**

```http
POST /peminjaman
Content-Type: application/json

{
  "anggota_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "buku_id": "b1c2d3e4-f5a6-7890-bcde-fa1234567890",
  "tanggal_pinjam": "2026-10-10",
  "tanggal_kembali": "2026-10-24"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Peminjaman berhasil dibuat",
  "data": {
    "id": "c1d2e3f4-a5b6-7890-cdef-ab1234567890",
    "anggota_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "buku_id": "b1c2d3e4-f5a6-7890-bcde-fa1234567890",
    "tanggal_pinjam": "2026-10-10",
    "tanggal_kembali": "2026-10-24",
    "tanggal_dikembalikan": null,
    "status": "Dipinjam",
    "created_at": "2026-10-10T13:00:00.000Z",
    "anggota": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "nama": "Budi Santoso",
      "email": "budi@email.com"
    },
    "buku": {
      "id": "b1c2d3e4-f5a6-7890-bcde-fa1234567890",
      "judul": "Laskar Pelangi",
      "pengarang": "Andrea Hirata"
    }
  }
}
```

### 4. Filter Peminjaman Berdasarkan Status

**Request:**

```http
GET /peminjaman?status=Terlambat
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Data peminjaman berhasil diambil",
  "count": 1,
  "data": [
    {
      "id": "c1d2e3f4-a5b6-7890-cdef-ab1234567890",
      "anggota_id": "a1b2c3d4-...",
      "buku_id": "b1c2d3e4-...",
      "tanggal_pinjam": "2026-09-01",
      "tanggal_kembali": "2026-09-15",
      "tanggal_dikembalikan": null,
      "status": "Terlambat",
      "anggota": {
        "id": "a1b2c3d4-...",
        "nama": "Budi Santoso",
        "email": "budi@email.com"
      },
      "buku": {
        "id": "b1c2d3e4-...",
        "judul": "Laskar Pelangi",
        "pengarang": "Andrea Hirata"
      }
    }
  ]
}
```

### 5. Kembalikan Buku

**Request:**

```http
PUT /peminjaman/c1d2e3f4-a5b6-7890-cdef-ab1234567890/kembalikan
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Buku berhasil dikembalikan",
  "terlambat": false,
  "data": {
    "id": "c1d2e3f4-a5b6-7890-cdef-ab1234567890",
    "status": "Dikembalikan",
    "tanggal_dikembalikan": "2026-10-10",
    "anggota": { "id": "...", "nama": "Budi Santoso", "email": "budi@email.com" },
    "buku": { "id": "...", "judul": "Laskar Pelangi", "pengarang": "Andrea Hirata" }
  }
}
```

### 6. Error Response

```json
{
  "success": false,
  "message": "Field 'anggota_id', 'buku_id', 'tanggal_pinjam', dan 'tanggal_kembali' wajib diisi"
}
```

---

## 🛠️ Panduan Instalasi & Menjalankan Lokal

### Prasyarat

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)
- Akun [Supabase](https://supabase.com/)
- (Opsional) [Vercel CLI](https://vercel.com/docs/cli) untuk deployment

### Langkah 1: Clone Repository

```bash
git clone https://github.com/USERNAME/perpustakaan-api.git
cd perpustakaan-api
```

### Langkah 2: Install Dependencies

```bash
npm install
```

### Langkah 3: Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com/)
2. Buka **SQL Editor** di Supabase Dashboard
3. Salin dan jalankan isi file `supabase-schema.sql` untuk membuat tabel dan data contoh
4. Salin **Project URL** dan **anon/public key** dari menu **Settings > API**

### Langkah 4: Konfigurasi Environment Variables

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan kredensial Supabase Anda:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...
PORT=3000
```

### Langkah 5: Jalankan Server Lokal

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`.

### Langkah 6: Test API

Gunakan **Postman**, **Thunder Client**, atau **curl**:

```bash
# Cek API berjalan
curl http://localhost:3000

# Ambil semua anggota
curl http://localhost:3000/anggota

# Tambah anggota baru
curl -X POST http://localhost:3000/anggota \
  -H "Content-Type: application/json" \
  -d '{"nama":"Budi","email":"budi@email.com"}'

# Filter peminjaman berdasarkan status
curl http://localhost:3000/peminjaman?status=Terlambat
```

---

## 🚀 Deployment ke Vercel

### Langkah 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Langkah 2: Login ke Vercel

```bash
vercel login
```

### Langkah 3: Deploy

```bash
vercel --prod
```

### Langkah 4: Tambah Environment Variables di Vercel

Pergi ke **Vercel Dashboard → Project Settings → Environment Variables**, lalu tambahkan:

| Key            | Value                          |
| -------------- | ------------------------------ |
| `SUPABASE_URL` | `https://xxxxx.supabase.co`    |
| `SUPABASE_KEY` | `eyJhbGciOiJIUzI1NiIs...`     |

Setelah menambahkan environment variables, lakukan redeploy:

```bash
vercel --prod
```

---

## 🧰 Tech Stack

| Teknologi     | Fungsi              |
| ------------- | ------------------- |
| Node.js       | Runtime JavaScript  |
| Express.js    | Web Framework       |
| Supabase      | Database (PostgreSQL) |
| Vercel        | Hosting / Deployment |
| Morgan        | HTTP Request Logger |
| CORS          | Cross-Origin Support |

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan tugas/pembelajaran. Silakan gunakan dan modifikasi sesuai kebutuhan.
