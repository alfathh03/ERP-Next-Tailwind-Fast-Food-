import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// GET: Ambil Detail PO (Untuk ditampilkan di form Edit)
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const db = await pool.getConnection();
  try {
    // Ambil Item Detail
    const [rows] = await db.execute(`
      SELECT pi.*, p.name as product_name
      FROM purchase_items pi
      JOIN products p ON pi.product_id = p.id
      WHERE pi.purchase_id = ?
    `, [params.id]);
    
    db.release();
    return NextResponse.json(rows);
  } catch (error: any) {
    db.release();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update PO (Simpan Perubahan Harga & Status)
export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const purchaseId = params.id;
  const db = await pool.getConnection();

  try {
    const body = await request.json();
    const { vendor_id, items, total, status } = body;

    // Cek Status Lama (Untuk mencegah stok nambah 2x)
    const [oldPO] = await db.execute<RowDataPacket[]>('SELECT status FROM purchases WHERE id = ?', [purchaseId]);
    const oldStatus = oldPO[0]?.status;

    if (oldStatus === 'Received') {
      db.release();
      return NextResponse.json({ message: 'PO ini sudah Diterima sebelumnya. Tidak bisa diedit lagi.' }, { status: 400 });
    }

    await db.beginTransaction();

    // 1. Update Header Purchase
    await db.execute(
      'UPDATE purchases SET vendor_id = ?, total = ?, status = ? WHERE id = ?',
      [vendor_id, total, status, purchaseId]
    );

    // 2. Reset Items (Hapus lama, Insert baru - cara paling aman untuk edit)
    await db.execute('DELETE FROM purchase_items WHERE purchase_id = ?', [purchaseId]);

    for (const item of items) {
      await db.execute(
        'INSERT INTO purchase_items (purchase_id, product_id, qty, cost) VALUES (?, ?, ?, ?)',
        [purchaseId, item.product_id, item.qty, item.cost]
      );

      // 3. LOGIKA STOK: Jika Status berubah jadi 'Received', Tambah Stok!
      if (status === 'Received') {
        await db.execute(
          'UPDATE products SET stock = stock + ?, cost = ? WHERE id = ?',
          [item.qty, item.cost, item.product_id] // Update Stok & Update Harga Modal (HPP) terbaru
        );
      }
    }

    await db.commit();
    db.release();
    return NextResponse.json({ message: 'PO Berhasil Diupdate' });

  } catch (error: any) {
    await db.rollback();
    db.release();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}