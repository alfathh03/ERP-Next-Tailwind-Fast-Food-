import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// GET: Ambil Data Pembelian
export async function GET() {
  try {
    const db = await pool.getConnection();
    const [rows] = await db.execute(`
      SELECT p.*, v.name as vendor_name 
      FROM purchases p
      LEFT JOIN vendors v ON p.vendor_id = v.id
      ORDER BY p.id DESC
    `);
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Simpan Pembelian Baru
export async function POST(request: Request) {
  const db = await pool.getConnection();
  try {
    const body = await request.json();
    const { vendor_id, items, total, status } = body;

    await db.beginTransaction();

    // 1. Buat Kode PO Otomatis
    const code = `PO-${Date.now()}`;

    // 2. Simpan Header
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO purchases (code, vendor_id, total, status, date) VALUES (?, ?, ?, ?, NOW())',
      [code, vendor_id, total, status]
    );
    const purchaseId = result.insertId;

    // 3. Simpan Items & Update Stok
    for (const item of items) {
      // Simpan Item ke Transaksi
      await db.execute(
        'INSERT INTO purchase_items (purchase_id, product_id, qty, cost) VALUES (?, ?, ?, ?)',
        [purchaseId, item.product_id, item.qty, item.cost]
      );

      // INTEGRASI OTOMATIS:
      // Jika Status "Received" (Barang Diterima), maka STOK BERTAMBAH
      if (status === 'Received') {
        await db.execute(
          'UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?',
          [item.qty, item.cost, item.product_id]
        );
      }
    }

    await db.commit();
    db.release();
    return NextResponse.json({ message: 'Pembelian Berhasil', code });

  } catch (error: any) {
    await db.rollback();
    db.release();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}