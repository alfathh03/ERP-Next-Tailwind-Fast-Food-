import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Perbaikan: Tambahkan tipe Promise pada params
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    // 1. WAJIB: Await params dulu agar ID terbaca (Khusus Next.js 15)
    const params = await props.params;
    const bomId = params.id;

    console.log(" API Detail BOM Dipanggil. ID:", bomId); 

    // Cek jika ID kosong/undefined
    if (!bomId || bomId === 'undefined') {
      return NextResponse.json({ error: "ID Parameter tidak valid" }, { status: 400 });
    }

    const db = await pool.getConnection();

    // 2. Eksekusi Query
    const [rows] = await db.execute(`
      SELECT bi.*, p.name as product_name, p.sku, p.category, p.image_url
      FROM bom_items bi
      JOIN products p ON bi.product_id = p.id
      WHERE bi.bom_id = ?
    `, [bomId]); // Sekarang bomId pasti sudah ada isinya

    db.release();
    return NextResponse.json(rows);

  } catch (error: any) {
    console.error(" Error Database:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}