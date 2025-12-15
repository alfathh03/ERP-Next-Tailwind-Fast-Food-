// lib/db.ts
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       // User default Laragon
  password: '',       // Password default Laragon (kosong)
  database: 'ERP',    // <--- SUDAH DIGANTI JADI 'ERP'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;