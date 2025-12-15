import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// GET: Ambil Daftar MO + Nama Produk
export async function GET() {
  try {
    const db = await pool.getConnection();
    const [rows] = await db.execute(`
      SELECT mo.*, p.name as product_name 
      FROM manufacturing_orders mo
      JOIN products p ON mo.product_id = p.id
      ORDER BY mo.id DESC
    `);
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Buat MO Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, qty } = body;
    
    // Validasi sederhana
    if (!product_id || !qty) {
      return NextResponse.json({ error: "Produk dan Jumlah harus diisi" }, { status: 400 });
    }

    const db = await pool.getConnection();
    const code = `MO-${Date.now()}`; // Generate kode unik

    await db.execute(
      'INSERT INTO manufacturing_orders (code, product_id, qty_to_produce, status) VALUES (?, ?, ?, ?)',
      [code, product_id, qty, 'Draft']
    );

    db.release();
    return NextResponse.json({ message: 'MO Berhasil Dibuat' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}