    import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const deliveryId = params.id;
  const db = await pool.getConnection();

  try {
    const { status } = await req.json();

    // Cek Status Lama
    const [oldRows] = await db.execute<RowDataPacket[]>('SELECT status, sales_order_id FROM deliveries WHERE id = ?', [deliveryId]);
    if (oldRows.length === 0) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    
    const { status: currentStatus, sales_order_id } = oldRows[0];

    // Jika mau kirim barang (Shipped)
    if (status === 'Shipped' && currentStatus !== 'Shipped') {
      await db.beginTransaction();

      // 1. Ambil Barang apa saja yang dijual di SO ini
      const [items] = await db.execute<RowDataPacket[]>(
        'SELECT product_id, qty FROM sales_order_items WHERE sales_order_id = ?',
        [sales_order_id]
      );

      // 2. Potong Stok
      for (const item of items) {
        await db.execute(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.qty, item.product_id]
        );
      }

      // 3. Update Status Delivery
      await db.execute('UPDATE deliveries SET status = ? WHERE id = ?', ['Shipped', deliveryId]);
      
      // 4. Update Status SO jadi 'Sent' (Opsional)
      await db.execute('UPDATE sales_orders SET status = ? WHERE id = ?', ['Sent', sales_order_id]);

      await db.commit();
      db.release();
      return NextResponse.json({ message: 'Barang Terkirim! Stok Berkurang.' });
    }

    // Update status biasa
    await db.execute('UPDATE deliveries SET status = ? WHERE id = ?', [status, deliveryId]);
    db.release();
    return NextResponse.json({ message: 'Status Updated' });

  } catch (err: any) {
    await db.rollback();
    db.release();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}