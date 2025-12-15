import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// --- GET: Ambil Semua Vendor ---
export async function GET() {
  try {
    const db = await pool.getConnection();
    const [rows] = await db.execute('SELECT * FROM vendors ORDER BY id DESC');
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- POST: Tambah Vendor Baru ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contact_person, phone, email, address } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama Vendor (PT/Toko) wajib diisi!" }, { status: 400 });
    }

    const db = await pool.getConnection();
    await db.execute(
      'INSERT INTO vendors (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_person, phone, email, address]
    );
    
    db.release();
    return NextResponse.json({ message: 'Vendor Berhasil Disimpan' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}