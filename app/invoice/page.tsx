'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, CheckCircle, TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react';

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  
  // State untuk Statistik Keuangan
  const [stats, setStats] = useState({ income: 0, expense: 0, profit: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSO, setSelectedSO] = useState('');

  // Helper Format Rupiah
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(n);

  // Fetch Data Lengkap
  async function initData() {
    try {
      // 1. Ambil Invoice & Summary Keuangan
      const resInv = await fetch('/api/invoice');
      if (resInv.ok) {
        const data = await resInv.json();
        setInvoices(data.invoices); // List Invoice
        setStats(data.summary);     // Data Keuangan (Income, Expense, Profit)
      }

      // 2. Ambil Sales Order (Untuk Dropdown)
      const resSO = await fetch('/api/sales');
      if (resSO.ok) setSalesOrders(await resSO.json());

    } catch (e) { console.error(e); }
  }

  useEffect(() => { initData(); }, []);

  // Handle Buat Invoice
  const handleCreate = async () => {
    if (!selectedSO) return alert("Pilih Sales Order");
    
    const so = salesOrders.find(s => s.id === Number(selectedSO));
    if (!so) return;

    const res = await fetch('/api/invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sales_order_id: selectedSO, total: so.total })
    });

    if (res.ok) {
      alert("Invoice Berhasil Dibuat!");
      setIsModalOpen(false);
      initData(); // Refresh data biar angka statistiknya update
    } else {
      const err = await res.json();
      alert("Gagal: " + err.error);
    }
  };

  // Handle Bayar (Lunas)
  const markPaid = async (id: number) => {
    if (!confirm("Tandai Lunas? Pemasukan akan bertambah.")) return;
    
    const res = await fetch(`/api/invoice/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Paid' })
    });

    if (res.ok) {
      initData(); // Refresh biar saldo nambah
    }
  };

  return (
    <div className="p-8">
      
      {/* --- DASHBOARD STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card Pemasukan */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Total Pemasukan</p>
            <h2 className="text-2xl font-bold text-green-600">{fmt(stats.income)}</h2>
          </div>
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <TrendingUp size={24}/>
          </div>
        </div>

        {/* Card Pengeluaran */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Total Pengeluaran (HPP)</p>
            <h2 className="text-2xl font-bold text-red-600">{fmt(stats.expense)}</h2>
          </div>
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <TrendingDown size={24}/>
          </div>
        </div>

        {/* Card Keuntungan */}
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-indigo-500 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-bold mb-1">Laba Bersih (Profit)</p>
            <h2 className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
              {fmt(stats.profit)}
            </h2>
          </div>
          <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
            <DollarSign size={24}/>
          </div>
        </div>
      </div>

      {/* HEADER & TOMBOL */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600"/> Daftar Tagihan (Invoice)
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-indigo-700 shadow">
          <Plus size={20}/> Buat Invoice
        </button>
      </div>

      {/* TABEL INVOICE */}
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4">No. Invoice</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Ref. Order</th>
              <th className="p-4">Total Tagihan</th>
              <th className="p-4">Jatuh Tempo</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-400">Belum ada invoice.</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-gray-700">{inv.code}</td>
                <td className="p-4 font-bold text-gray-800">{inv.customer_name}</td>
                <td className="p-4 text-indigo-600 text-sm">{inv.so_code}</td>
                <td className="p-4 font-bold">{fmt(Number(inv.total))}</td>
                <td className="p-4 text-sm text-gray-500">
                    {/* Cek Validitas Tanggal */}
                    {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '-'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    inv.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {inv.status === 'Paid' ? 'LUNAS' : 'BELUM BAYAR'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {inv.status !== 'Paid' ? (
                    <button 
                        onClick={() => markPaid(inv.id)} 
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-700 flex items-center gap-1 ml-auto shadow-sm"
                    >
                      <CheckCircle size={14}/> Terima Bayar
                    </button>
                  ) : (
                    <span className="text-green-600 text-xs font-bold flex items-center justify-end gap-1">
                        <CheckCircle size={16}/> Selesai
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL BUAT INVOICE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative">
            <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
                <X size={20}/>
            </button>

            <h2 className="text-xl font-bold mb-4">Buat Tagihan Baru</h2>
            <p className="text-sm text-gray-500 mb-4">Pilih Sales Order yang akan ditagihkan kepada pelanggan.</p>
            
            <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Pilih Sales Order</label>
                <select 
                    className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={selectedSO} 
                    onChange={e => setSelectedSO(e.target.value)}
                >
                <option value="">-- Pilih Order --</option>
                {salesOrders.map(s => (
                    <option key={s.id} value={s.id}>
                        {s.code} - {s.customer_name} ({fmt(Number(s.total))})
                    </option>
                ))}
                </select>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow">Buat Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}