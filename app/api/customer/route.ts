import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// --- GET: Ambil Semua Customer ---
export async function GET() {
  try {
    const db = await pool.getConnection();
    // Mengambil data urut dari yang terbaru
    const [rows] = await db.execute('SELECT * FROM customers ORDER BY id DESC');
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Database Error (GET):", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- POST: Tambah Customer Baru ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    // 1. Validasi Input
    if (!name) {
      return NextResponse.json({ error: "Nama Pelanggan wajib diisi!" }, { status: 400 });
    }

    const db = await pool.getConnection();
    
    // 2. Simpan ke Database
    await db.execute(
      'INSERT INTO customers (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [name, email, phone, address]
    );
    
    db.release();
    return NextResponse.json({ message: 'Berhasil disimpan' });

  } catch (error: any) {
    console.error("Database Error (POST):", error);
    // Mengirim pesan error asli ke Frontend agar bisa dibaca
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}