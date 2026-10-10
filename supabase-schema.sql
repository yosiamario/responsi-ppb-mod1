CREATE TABLE IF NOT EXISTS anggota (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  no_telepon VARCHAR(20),
  alamat TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buku (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  judul VARCHAR(500) NOT NULL,
  pengarang VARCHAR(255) NOT NULL,
  penerbit VARCHAR(255),
  tahun_terbit INTEGER,
  isbn VARCHAR(20),
  stok INTEGER DEFAULT 1 CHECK (stok >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS peminjaman (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anggota_id UUID NOT NULL REFERENCES anggota(id) ON DELETE CASCADE,
  buku_id UUID NOT NULL REFERENCES buku(id) ON DELETE CASCADE,
  tanggal_pinjam DATE NOT NULL,
  tanggal_kembali DATE NOT NULL,
  tanggal_dikembalikan DATE,
  status VARCHAR(20) DEFAULT 'Dipinjam' CHECK (status IN ('Dipinjam', 'Dikembalikan', 'Terlambat')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_peminjaman_status ON peminjaman(status);
CREATE INDEX IF NOT EXISTS idx_peminjaman_anggota ON peminjaman(anggota_id);
CREATE INDEX IF NOT EXISTS idx_peminjaman_buku ON peminjaman(buku_id);
CREATE INDEX IF NOT EXISTS idx_buku_isbn ON buku(isbn);
CREATE INDEX IF NOT EXISTS idx_anggota_email ON anggota(email);

INSERT INTO anggota (nama, email, no_telepon, alamat) VALUES
  ('Budi Santoso', 'budi@email.com', '081234567890', 'Jl. Merdeka No. 10, Jakarta'),
  ('Siti Rahayu', 'siti@email.com', '082345678901', 'Jl. Sudirman No. 25, Bandung'),
  ('Ahmad Fauzi', 'ahmad@email.com', '083456789012', 'Jl. Gajah Mada No. 5, Surabaya');

INSERT INTO buku (judul, pengarang, penerbit, tahun_terbit, isbn, stok) VALUES
  ('Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', 2005, '978-979-1227-00-2', 5),
  ('Bumi Manusia', 'Pramoedya Ananta Toer', 'Hasta Mitra', 1980, '978-979-9023-00-1', 3),
  ('Filosofi Teras', 'Henry Manampiring', 'Penerbit Buku Kompas', 2018, '978-602-412-60-3', 4),
  ('Atomic Habits', 'James Clear', 'Gramedia Pustaka Utama', 2019, '978-602-063-828-4', 2);
