require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const anggotaRoutes = require("../src/routes/anggota");
const bukuRoutes = require("../src/routes/buku");
const peminjamanRoutes = require("../src/routes/peminjaman");
const { errorHandler, notFoundHandler } = require("../src/middleware/errorHandler");

const app = express();

// ──────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ──────────────────────────────────────────────
// Root endpoint
// ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "📚 Selamat datang di API Perpustakaan!",
    version: "1.0.0",
    endpoints: {
      anggota: {
        "GET /anggota": "Ambil semua anggota",
        "GET /anggota/:id": "Ambil anggota berdasarkan ID",
        "POST /anggota": "Tambah anggota baru",
        "PUT /anggota/:id": "Update data anggota",
        "DELETE /anggota/:id": "Hapus anggota",
      },
      buku: {
        "GET /buku": "Ambil semua buku",
        "GET /buku/:id": "Ambil buku berdasarkan ID",
        "POST /buku": "Tambah buku baru",
        "PUT /buku/:id": "Update data buku",
        "DELETE /buku/:id": "Hapus buku",
      },
      peminjaman: {
        "GET /peminjaman": "Ambil semua peminjaman (filter: ?status=Dipinjam|Dikembalikan|Terlambat)",
        "GET /peminjaman/:id": "Ambil detail peminjaman",
        "POST /peminjaman": "Buat peminjaman baru",
        "PUT /peminjaman/:id": "Update data peminjaman",
        "PUT /peminjaman/:id/kembalikan": "Kembalikan buku",
        "DELETE /peminjaman/:id": "Hapus data peminjaman",
      },
    },
  });
});

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────
app.use("/anggota", anggotaRoutes);
app.use("/buku", bukuRoutes);
app.use("/peminjaman", peminjamanRoutes);

// ──────────────────────────────────────────────
// Error handling
// ──────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ──────────────────────────────────────────────
// Start server (hanya jika bukan di Vercel)
// ──────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;
