import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET() {
  const db = await pool.getConnection();
  try {
    // 1. Hitung Total Omzet (Invoice Lunas)
    const [incomeRes] = await db.execute<RowDataPacket[]>("SELECT SUM(total) as val FROM invoices WHERE status = 'Paid'");
    
    // 2. Hitung Total Pengeluaran (Purchase Received)
    const [expenseRes] = await db.execute<RowDataPacket[]>("SELECT SUM(total) as val FROM purchases WHERE status = 'Received'");

    // 3. Hitung Jumlah Order Aktif (Belum Dikirim)
    const [activeSORes] = await db.execute<RowDataPacket[]>("SELECT COUNT(*) as val FROM sales_orders WHERE status != 'Sent'");

    // 4. Cek Stok Menipis (Alert) - Stok dibawah 10
    const [lowStockRes] = await db.execute<RowDataPacket[]>("SELECT name, stock FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 5");

    // 5. Transaksi Terakhir (Recent Sales)
    const [recentSales] = await db.execute<RowDataPacket[]>(`
      SELECT s.code, c.name as customer, s.total, s.status, s.order_date 
      FROM sales_orders s
      JOIN customers c ON s.customer_id = c.id
      ORDER BY s.id DESC LIMIT 5
    `);

    db.release();

    return NextResponse.json({
      income: Number(incomeRes[0].val || 0),
      expense: Number(expenseRes[0].val || 0),
      activeOrders: Number(activeSORes[0].val || 0),
      lowStock: lowStockRes,
      recentSales: recentSales
    });

  } catch (error: any) {
    db.release();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}