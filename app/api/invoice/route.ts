import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// --- GET: Ambil Invoice + Data Keuangan ---
export async function GET() {
  const db = await pool.getConnection();
  try {
    // 1. Ambil Daftar Invoice
    const [invoices] = await db.execute(`
      SELECT i.*, s.code as so_code, c.name as customer_name
      FROM invoices i
      JOIN sales_orders s ON i.sales_order_id = s.id
      JOIN customers c ON s.customer_id = c.id
      ORDER BY i.id DESC
    `);

    // 2. Hitung Total Pemasukan (Invoice Lunas)
    const [incomeResult] = await db.execute<RowDataPacket[]>(
      "SELECT SUM(total) as total_income FROM invoices WHERE status = 'Paid'"
    );
    const totalIncome = Number(incomeResult[0].total_income || 0);

    // 3. Hitung Total Pengeluaran (Purchase Diterima)
    const [expenseResult] = await db.execute<RowDataPacket[]>(
      "SELECT SUM(total) as total_expense FROM purchases WHERE status = 'Received'"
    );
    const totalExpense = Number(expenseResult[0].total_expense || 0);

    db.release();

    // Kembalikan Data Paket Lengkap
    return NextResponse.json({
      invoices,
      summary: {
        income: totalIncome,
        expense: totalExpense,
        profit: totalIncome - totalExpense
      }
    });

  } catch (err: any) {
    db.release();
    console.error("GET Invoice Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// --- POST: Buat Invoice Baru ---
export async function POST(req: Request) {
  const db = await pool.getConnection();
  try {
    const body = await req.json();
    const { sales_order_id, total } = body;

    // Cek apakah SO ini sudah pernah dibuatkan invoice?
    const [exist] = await db.execute<RowDataPacket[]>('SELECT id FROM invoices WHERE sales_order_id = ?', [sales_order_id]);
    if (exist.length > 0) {
      db.release();
      return NextResponse.json({ error: "Sales Order ini sudah punya Invoice!" }, { status: 400 });
    }

    const code = `INV-${Date.now()}`;
    // Set Jatuh Tempo 30 Hari kedepan
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0]; // Format YYYY-MM-DD

    await db.execute(
      'INSERT INTO invoices (code, sales_order_id, total, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [code, sales_order_id, total, dueDateStr, 'Unpaid']
    );
    
    db.release();
    return NextResponse.json({ message: 'Invoice Created' });
  } catch (err: any) {
    db.release();
    console.error("POST Invoice Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}