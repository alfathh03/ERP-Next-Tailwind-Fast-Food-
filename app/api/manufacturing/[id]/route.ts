import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const moId = params.id;
  const db = await pool.getConnection();

  try {
    const body = await request.json();
    const { status } = body; 

    // Cek Status Sekarang di Database
    const [existingMO] = await db.execute<RowDataPacket[]>(
      'SELECT status, product_id, qty_to_produce FROM manufacturing_orders WHERE id = ?', 
      [moId]
    );

    if (existingMO.length === 0) {
      db.release();
      return NextResponse.json({ error: "MO Tidak Ditemukan" }, { status: 404 });
    }

    const currentStatus = existingMO[0].status;

    // --- PROTEKSI PENTING ---
    // Jika di database sudah 'Done', JANGAN lakukan apa-apa lagi!
    if (currentStatus === 'Done') {
      db.release();
      return NextResponse.json({ message: 'Order ini sudah selesai sebelumnya. Stok aman.' });
    }

    // Jika user minta 'Done' dan status sekarang belum Done, baru proses potong stok
    if (status === 'Done') {
      await db.beginTransaction();

      const { product_id, qty_to_produce } = existingMO[0];

      // 1. Cari Resep (BOM)
      const [bomRows] = await db.execute<RowDataPacket[]>(
        'SELECT id FROM boms WHERE product_id = ? LIMIT 1',
        [product_id]
      );

      if (bomRows.length === 0) {
        throw new Error("Gagal: Produk ini belum punya Resep (BOM).");
      }
      const bomId = bomRows[0].id;

      // 2. Ambil Bahan Baku
      const [ingredients] = await db.execute<RowDataPacket[]>(
        'SELECT product_id, qty FROM bom_items WHERE bom_id = ?',
        [bomId]
      );

      // 3. Potong Stok (Looping)
      for (const item of ingredients) {
        const totalNeeded = Number(item.qty) * Number(qty_to_produce);
        await db.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [totalNeeded, item.product_id]
        );
      }

      // 4. Tambah Stok Jadi
      await db.execute(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [qty_to_produce, product_id]
      );

      // 5. Update Status jadi Done
      await db.execute(
        'UPDATE manufacturing_orders SET status = ? WHERE id = ?',
        ['Done', moId]
      );

      await db.commit();
      db.release();
      return NextResponse.json({ message: 'Produksi Selesai! Stok Diupdate.' });
    }

    // Update status selain Done (misal Cancel)
    await db.execute('UPDATE manufacturing_orders SET status = ? WHERE id = ?', [status, moId]);
    db.release();
    return NextResponse.json({ message: 'Status Updated' });

  } catch (error: any) {
    await db.rollback();
    db.release();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}