import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// --- GET: Ambil Daftar Delivery ---
export async function GET() {
  try {
    const db = await pool.getConnection();
    const [rows] = await db.execute(`
      SELECT d.*, s.code as so_code, c.name as customer_name
      FROM deliveries d
      JOIN sales_orders s ON d.sales_order_id = s.id
      JOIN customers c ON s.customer_id = c.id
      ORDER BY d.id DESC
    `);
    db.release();
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// --- POST: Buat Delivery Baru ---
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sales_order_id } = body;

    // Validasi input
    if (!sales_order_id) {
      return NextResponse.json({ error: "Sales Order ID wajib diisi" }, { status: 400 });
    }
    
    const db = await pool.getConnection();
    
    // Generate Kode DO
    const code = `DO-${Date.now()}`;
    
    // PERBAIKAN DI SINI:
    // Saya menghapus kolom 'date' dan value 'NOW()'
    // karena database kamu belum punya kolom date.
    await db.execute(
      'INSERT INTO deliveries (code, sales_order_id, status) VALUES (?, ?, ?)',
      [code, Number(sales_order_id), 'Draft']
    );
    
    db.release();
    return NextResponse.json({ message: 'Delivery Created' });
  } catch (err: any) {
    console.error("POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}