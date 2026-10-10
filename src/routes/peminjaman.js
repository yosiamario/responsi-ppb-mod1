const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// ──────────────────────────────────────────────
// GET /peminjaman — Ambil semua data peminjaman (dengan filter query)
// Filter: ?status=Dipinjam | ?status=Dikembalikan | ?status=Terlambat
//         ?anggota_id=xxx  | ?buku_id=xxx
// ──────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { status, anggota_id, buku_id } = req.query;

    let query = supabase
      .from("peminjaman")
      .select(`
        *,
        anggota:anggota_id ( id, nama, email ),
        buku:buku_id ( id, judul, pengarang )
      `)
      .order("created_at", { ascending: false });

    // Filter berdasarkan status: Dipinjam, Dikembalikan, Terlambat
    if (status) query = query.eq("status", status);
    if (anggota_id) query = query.eq("anggota_id", anggota_id);
    if (buku_id) query = query.eq("buku_id", buku_id);

    const { data, error } = await query;

    if (error) throw { statusCode: 400, message: error.message };

    res.json({
      success: true,
      message: "Data peminjaman berhasil diambil",
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// GET /peminjaman/:id — Ambil detail peminjaman berdasarkan ID
// ──────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("peminjaman")
      .select(`
        *,
        anggota:anggota_id ( id, nama, email, no_telepon ),
        buku:buku_id ( id, judul, pengarang, isbn )
      `)
      .eq("id", req.params.id)
      .single();

    if (error) throw { statusCode: 404, message: "Data peminjaman tidak ditemukan" };

    res.json({
      success: true,
      message: "Detail peminjaman berhasil diambil",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// POST /peminjaman — Buat peminjaman baru
// ──────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { anggota_id, buku_id, tanggal_pinjam, tanggal_kembali } = req.body;

    // Validasi field wajib
    if (!anggota_id || !buku_id || !tanggal_pinjam || !tanggal_kembali) {
      throw {
        statusCode: 400,
        message: "Field 'anggota_id', 'buku_id', 'tanggal_pinjam', dan 'tanggal_kembali' wajib diisi",
      };
    }

    // Cek apakah anggota ada
    const { data: anggota, error: errAnggota } = await supabase
      .from("anggota")
      .select("id")
      .eq("id", anggota_id)
      .single();

    if (errAnggota || !anggota) {
      throw { statusCode: 404, message: "Anggota tidak ditemukan" };
    }

    // Cek apakah buku ada dan stok tersedia
    const { data: buku, error: errBuku } = await supabase
      .from("buku")
      .select("id, judul, stok")
      .eq("id", buku_id)
      .single();

    if (errBuku || !buku) {
      throw { statusCode: 404, message: "Buku tidak ditemukan" };
    }

    if (buku.stok <= 0) {
      throw { statusCode: 400, message: `Stok buku "${buku.judul}" habis` };
    }

    // Buat peminjaman
    const { data, error } = await supabase
      .from("peminjaman")
      .insert([
        {
          anggota_id,
          buku_id,
          tanggal_pinjam,
          tanggal_kembali,
          status: "Dipinjam",
        },
      ])
      .select(`
        *,
        anggota:anggota_id ( id, nama, email ),
        buku:buku_id ( id, judul, pengarang )
      `)
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    // Kurangi stok buku
    await supabase
      .from("buku")
      .update({ stok: buku.stok - 1 })
      .eq("id", buku_id);

    res.status(201).json({
      success: true,
      message: "Peminjaman berhasil dibuat",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// PUT /peminjaman/:id — Update data peminjaman
// ──────────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const { tanggal_kembali, status } = req.body;

    const updateData = {};
    if (tanggal_kembali) updateData.tanggal_kembali = tanggal_kembali;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      throw { statusCode: 400, message: "Tidak ada data yang diperbarui" };
    }

    const { data, error } = await supabase
      .from("peminjaman")
      .update(updateData)
      .eq("id", req.params.id)
      .select(`
        *,
        anggota:anggota_id ( id, nama, email ),
        buku:buku_id ( id, judul, pengarang )
      `)
      .single();

    if (error) throw { statusCode: 400, message: error.message };
    if (!data) throw { statusCode: 404, message: "Data peminjaman tidak ditemukan" };

    res.json({
      success: true,
      message: "Data peminjaman berhasil diperbarui",
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// PUT /peminjaman/:id/kembalikan — Kembalikan buku
// ──────────────────────────────────────────────
router.put("/:id/kembalikan", async (req, res, next) => {
  try {
    // Ambil data peminjaman
    const { data: peminjaman, error: errPeminjaman } = await supabase
      .from("peminjaman")
      .select("*, buku:buku_id ( id, stok )")
      .eq("id", req.params.id)
      .single();

    if (errPeminjaman || !peminjaman) {
      throw { statusCode: 404, message: "Data peminjaman tidak ditemukan" };
    }

    if (peminjaman.status === "Dikembalikan") {
      throw { statusCode: 400, message: "Buku sudah dikembalikan sebelumnya" };
    }

    const today = new Date().toISOString().split("T")[0];
    const isLate = today > peminjaman.tanggal_kembali;

    // Update status peminjaman
    const { data, error } = await supabase
      .from("peminjaman")
      .update({
        status: "Dikembalikan",
        tanggal_dikembalikan: today,
      })
      .eq("id", req.params.id)
      .select(`
        *,
        anggota:anggota_id ( id, nama, email ),
        buku:buku_id ( id, judul, pengarang )
      `)
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    // Tambah stok buku kembali
    await supabase
      .from("buku")
      .update({ stok: peminjaman.buku.stok + 1 })
      .eq("id", peminjaman.buku_id);

    res.json({
      success: true,
      message: isLate
        ? "Buku dikembalikan (terlambat!)"
        : "Buku berhasil dikembalikan",
      terlambat: isLate,
      data,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────
// DELETE /peminjaman/:id — Hapus data peminjaman
// ──────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    // Ambil data peminjaman untuk restore stok jika masih dipinjam
    const { data: existing, error: errExist } = await supabase
      .from("peminjaman")
      .select("*, buku:buku_id ( id, stok )")
      .eq("id", req.params.id)
      .single();

    if (errExist || !existing) {
      throw { statusCode: 404, message: "Data peminjaman tidak ditemukan" };
    }

    // Hapus peminjaman
    const { data, error } = await supabase
      .from("peminjaman")
      .delete()
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw { statusCode: 400, message: error.message };

    // Jika buku belum dikembalikan, restore stok
    if (existing.status === "Dipinjam" || existing.status === "Terlambat") {
      await supabase
        .from("buku")
        .update({ stok: existing.buku.stok + 1 })
        .eq("id", existing.buku_id);
    }

    res.json({
      success: true,
      message: "Data peminjaman berhasil dihapus",
      data,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
