import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const db = await pool.getConnection();
  const { status } = await req.json(); // 'Paid'

  await db.execute('UPDATE invoices SET status = ? WHERE id = ?', [status, params.id]);
  
  db.release();
  return NextResponse.json({ message: 'Status Updated' });
}