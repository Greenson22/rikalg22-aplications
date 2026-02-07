import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'rikalg22.db');
const db = new Database(dbPath);

const initDb = () => {
  // Tabel Profiles (Existing)
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      profileName TEXT,
      fullName TEXT,
      details TEXT,
      attachments TEXT
    )
  `);

  // Tabel Signatures (BARU)
  db.exec(`
    CREATE TABLE IF NOT EXISTS signatures (
      id TEXT PRIMARY KEY,
      name TEXT,
      image TEXT  -- Base64 string gambar
    )
  `);
};

initDb();

export default db;