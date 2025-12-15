 import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// GET: Ambil Daftar Penjualan (Join dengan Customer)
export async function GET() {
  try {
    const db = await pool.getConnection();
    const [rows] = await db.execute(`
      SELECT s.*, c.name as customer_name 
      FROM sales_orders s
      LEFT JOIN customers c ON s.customer_id = c.id
      ORDER BY s.order_date DESC, s.id DESC
    `);
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Buat Transaksi Penjualan Baru
export async function POST(request: Request) {
  const db = await pool.getConnection();
  try {
    const body = await request.json();
    const { customer_id, items, total, status } = body;

    // 1. Mulai Transaksi
    await db.beginTransaction();

    // 2. Buat Nomor Order Otomatis (Contoh: SO-Timestamp)
    const code = `SO-${Date.now()}`;

    // 3. Simpan ke Tabel Header (sales_orders)
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO sales_orders (code, customer_id, total, status, order_date) VALUES (?, ?, ?, ?, NOW())',
      [code, customer_id, total, status]
    );
    const salesOrderId = result.insertId;

    // 4. Simpan ke Tabel Detail (sales_order_items)
    for (const item of items) {
      await db.execute(
        'INSERT INTO sales_order_items (sales_order_id, product_id, qty, price) VALUES (?, ?, ?, ?)',
        [salesOrderId, item.product_id, item.qty, item.price]
      );
      
      // (Opsional) Kurangi Stok Produk disini jika statusnya 'Done'
      // await db.execute('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.product_id]);
    }

    // 5. Commit (Simpan Permanen)
    await db.commit();
    db.release();

    return NextResponse.json({ message: 'Penjualan Berhasil Disimpan', code });

  } catch (error: any) {
    // Jika error, batalkan semua perubahan
    await db.rollback();
    db.release();
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}