const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// ──────────────────────────────────────────────
// GET /anggota — Ambil semua anggota
// ──────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { nama, email } = req.query;

    let query = supabase.from("anggota").select("*").order("created_at", { ascending: false });

    if (nama) query = query.ilike("nama", `%${nama}%`);
    if (email) query = query.ilike("email", `%${email}%`);

    const { data, error } = await query;

    if (error) throw { statusCode: 400, message: error.message };

    res.json({
      success: true,
      message: "Data anggota berhasil diambil",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /anggota/:id — Ambil anggota berdasarkan ID
// ──────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("anggota")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) throw { statusCode: 404, message: "Anggota tidak ditemukan" };

    res.json({
      success: true,
      message: "Data anggota berhasil diambil",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /anggota — Tambah anggota baru
// ──────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { nama, email, no_telepon, alamat } = req.body;

    if (!nama || !email) {
      throw { statusCode: 400, message: "Field 'nama' dan 'email' wajib diisi" };
    }

    const { data, error } = await supabase
      .from("anggota")
      .insert([{ nama, email, no_telepon, alamat }])
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    res.status(201).json({
      success: true,
      message: "Anggota berhasil ditambahkan",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// PUT /anggota/:id — Update data anggota
// ──────────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const { nama, email, no_telepon, alamat } = req.body;

    const { data, error } = await supabase
      .from("anggota")
      .update({ nama, email, no_telepon, alamat })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    if (!data) throw { statusCode: 404, message: "Anggota tidak ditemukan" };

    res.json({
      success: true,
      message: "Data anggota berhasil diperbarui",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// DELETE /anggota/:id — Hapus anggota
// ──────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("anggota")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    if (!data) throw { statusCode: 404, message: "Anggota tidak ditemukan" };

    res.json({
      success: true,
      message: "Anggota berhasil dihapus",
      data,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
