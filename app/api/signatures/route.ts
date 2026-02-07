// src/app/api/signatures/route.ts
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Ambil semua signature
export async function GET() {
  try {
    const stmt = db.prepare('SELECT * FROM signatures');
    const rows = stmt.all();
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

// POST: Simpan signature baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, image } = body;

    const stmt = db.prepare('INSERT INTO signatures (id, name, image) VALUES (?, ?, ?)');
    stmt.run(id, name, image);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
  }
}

// PUT: Rename signature
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name } = body;

    const stmt = db.prepare('UPDATE signatures SET name = ? WHERE id = ?');
    stmt.run(name, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update data' }, { status: 500 });
  }
}

// DELETE: Hapus signature
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const stmt = db.prepare('DELETE FROM signatures WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus data' }, { status: 500 });
  }
}