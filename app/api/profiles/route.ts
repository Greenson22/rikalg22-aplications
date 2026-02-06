// src/app/api/profiles/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db'; // Pastikan path import sesuai struktur Anda

// GET: Ambil semua profil
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM profiles');
    const rows = stmt.all();
    
    // Parse kembali string JSON menjadi Object agar bisa dibaca Frontend
    const profiles = rows.map((row: any) => ({
      ...row,
      details: JSON.parse(row.details),
      attachments: JSON.parse(row.attachments)
    }));

    return NextResponse.json(profiles);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST: Simpan profil baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, profileName, fullName, details, attachments } = body;

    const stmt = db.prepare(`
      INSERT INTO profiles (id, profileName, fullName, details, attachments)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Stringify array/objek sebelum masuk SQLite
    stmt.run(id, profileName, fullName, JSON.stringify(details), JSON.stringify(attachments));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}

// DELETE: Hapus profil
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const stmt = db.prepare('DELETE FROM profiles WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}

// PUT: Update profil (Opsional, untuk fitur edit)
export async function PUT(req: Request) {
    try {
      const body = await req.json();
      const { id, profileName, fullName, details, attachments } = body;
  
      const stmt = db.prepare(`
        UPDATE profiles 
        SET profileName = ?, fullName = ?, details = ?, attachments = ?
        WHERE id = ?
      `);
  
      stmt.run(profileName, fullName, JSON.stringify(details), JSON.stringify(attachments), id);
  
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Gagal update data' }, { status: 500 });
    }
}