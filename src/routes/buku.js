const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// ──────────────────────────────────────────────
// GET /buku — Ambil semua buku (dengan filter opsional)
// ──────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { judul, pengarang, isbn } = req.query;

    let query = supabase.from("buku").select("*").order("created_at", { ascending: false });

    if (judul) query = query.ilike("judul", `%${judul}%`);
    if (pengarang) query = query.ilike("pengarang", `%${pengarang}%`);
    if (isbn) query = query.eq("isbn", isbn);

    const { data, error } = await query;

    if (error) throw { statusCode: 400, message: error.message };

    res.json({
      success: true,
      message: "Data buku berhasil diambil",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /buku/:id — Ambil buku berdasarkan ID
// ──────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw { statusCode: 404, message: "Buku tidak ditemukan" };

    res.json({
      success: true,
      message: "Data buku berhasil diambil",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /buku — Tambah buku baru
// ──────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { judul, pengarang, penerbit, tahun_terbit, isbn, stok } = req.body;

    if (!judul || !pengarang) {
      throw { statusCode: 400, message: "Field 'judul' dan 'pengarang' wajib diisi" };
    }

    const { data, error } = await supabase
      .from("buku")
      .insert([{ judul, pengarang, penerbit, tahun_terbit, isbn, stok: stok || 1 }])
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({
      success: true,
      message: "Buku berhasil ditambahkan",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// PUT /buku/:id — Update data buku
// ──────────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const { judul, pengarang, penerbit, tahun_terbit, isbn, stok } = req.body;

    const { data, error } = await supabase
      .from("buku")
      .update({ judul, pengarang, penerbit, tahun_terbit, isbn, stok })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    if (!data) throw { statusCode: 404, message: "Buku tidak ditemukan" };

    res.json({
      success: true,
      message: "Data buku berhasil diperbarui",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// DELETE /buku/:id — Hapus buku
// ──────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("buku")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    if (!data) throw { statusCode: 404, message: "Buku tidak ditemukan" };

    res.json({
      success: true,
      message: "Buku berhasil dihapus",
      data,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
