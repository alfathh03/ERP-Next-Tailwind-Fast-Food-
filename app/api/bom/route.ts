import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { ResultSetHeader } from 'mysql2';

// GET: Ambil Daftar BOM + Nama Produknya
export async function GET() {
  try {
    const db = await pool.getConnection();
    // Join ke tabel products untuk dapat nama menu
    const [rows] = await db.execute(`
      SELECT b.*, p.name as product_name 
      FROM boms b
      JOIN products p ON b.product_id = p.id
      ORDER BY b.id DESC
    `);
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Buat Resep Baru
export async function POST(request: Request) {
  const db = await pool.getConnection();
  try {
    const body = await request.json();
    const { name, product_id, items } = body; // items adalah array bahan

    await db.beginTransaction();

    // 1. Simpan Header BOM
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO boms (name, product_id) VALUES (?, ?)',
      [name, product_id]
    );
    const bomId = result.insertId;

    // 2. Simpan Detail Bahan (Looping)
    for (const item of items) {
      await db.execute(
        'INSERT INTO bom_items (bom_id, product_id, qty) VALUES (?, ?, ?)',
        [bomId, item.product_id, item.qty]
      );
    }

    await db.commit();
    db.release();

    return NextResponse.json({ message: 'BOM Berhasil Disimpan' });

  } catch (error: any) {
    await db.rollback(); // Batalkan jika error
    db.release();
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}