import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const db = await pool.getConnection();
  const [rows] = await db.execute(`
    SELECT i.*, s.code as so_code, c.name as customer_name
    FROM invoices i
    JOIN sales_orders s ON i.sales_order_id = s.id
    JOIN customers c ON s.customer_id = c.id
    ORDER BY i.id DESC
  `);
  db.release();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { sales_order_id, total } = await req.json();
  const db = await pool.getConnection();
  
  const code = `INV-${Date.now()}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Jatuh tempo 30 hari

  await db.execute(
    'INSERT INTO invoices (code, sales_order_id, total, due_date, status) VALUES (?, ?, ?, ?, ?)',
    [code, sales_order_id, total, dueDate, 'Unpaid']
  );
  
  db.release();
  return NextResponse.json({ message: 'Invoice Created' });
}