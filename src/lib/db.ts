import Database from 'better-sqlite3';
import path from 'path';

// Membuat file database 'surat.db' di root project
const dbPath = path.join(process.cwd(), 'rikalg22.db');
const db = new Database(dbPath);

// Inisialisasi Tabel saat pertama kali jalan
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      profileName TEXT,
      fullName TEXT,
      details TEXT,      -- Kita simpan array JSON sebagai string
      attachments TEXT   -- Kita simpan array JSON sebagai string
    )
  `);
};

initDb();

export default db;