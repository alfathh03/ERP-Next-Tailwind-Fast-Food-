import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET: Ambil Detail Item per RFQ
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const rfqId = params.id;
  
  try {
    const db = await pool.getConnection();
    // Ambil item lengkap dengan nama produk
    const [rows] = await db.execute(`
      SELECT ri.*, p.name as product_name, p.price as est_price
      FROM rfq_items ri
      JOIN products p ON ri.product_id = p.id
      WHERE ri.rfq_id = ?
    `, [rfqId]);
    
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update Status (Misal jadi 'Converted' saat sudah jadi PO)
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const db = await pool.getConnection();
  try {
    const body = await request.json();
    await db.execute('UPDATE rfqs SET status = ? WHERE id = ?', [body.status, params.id]);
    db.release();
    return NextResponse.json({ message: 'Status Updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}