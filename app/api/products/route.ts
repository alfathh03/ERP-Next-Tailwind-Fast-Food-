import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Ambil data
export async function GET() {
  try {
    const db = await pool.getConnection();
    const [rows] = await db.execute('SELECT * FROM products ORDER BY id DESC');
    db.release();

    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Simpan data baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // PERBAIKAN DISINI: Pastikan 'stock' diambil dari body
    const { name, sku, category, price, cost, stock, image_url } = body;
    
    const db = await pool.getConnection();
    
    // PERBAIKAN SQL: Tambahkan kolom 'stock' ke dalam INSERT
    await db.execute(
      'INSERT INTO products (name, sku, category, price, cost, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, sku, category, price, cost, stock, image_url]
    );
    
    db.release();
    
    return NextResponse.json({ message: 'Produk berhasil disimpan' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}