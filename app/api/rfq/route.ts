import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// GET: Ambil Daftar RFQ (Join dengan Vendor)
export async function GET() {
  try {
    const db = await pool.getConnection();
    const [rows] = await db.execute(`
      SELECT r.*, v.name as vendor_name 
      FROM rfqs r
      JOIN vendors v ON r.vendor_id = v.id
      ORDER BY r.id DESC
    `);
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Buat RFQ Baru
export async function POST(request: Request) {
  const db = await pool.getConnection();
  try {
    const body = await request.json();
    const { vendor_id, items } = body; // items = [{product_id, qty}]

    await db.beginTransaction();

    // 1. Generate Kode RFQ
    const code = `RFQ-${Date.now()}`;

    // 2. Simpan Header
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO rfqs (code, vendor_id, status) VALUES (?, ?, ?)',
      [code, vendor_id, 'Draft']
    );
    const rfqId = result.insertId;

    // 3. Simpan Detail Items
    for (const item of items) {
      await db.execute(
        'INSERT INTO rfq_items (rfq_id, product_id, qty) VALUES (?, ?, ?)',
        [rfqId, item.product_id, item.qty]
      );
    }

    await db.commit();
    db.release();
    return NextResponse.json({ message: 'RFQ Berhasil Dibuat', code });

  } catch (error: any) {
    await db.rollback();
    db.release();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}