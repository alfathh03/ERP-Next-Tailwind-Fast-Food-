'use client';

import { useEffect, useState } from 'react';
import { Truck, Plus, CheckCircle, ArrowRight, X } from 'lucide-react';

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSO, setSelectedSO] = useState('');

  // Helper: Format Rupiah
  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  // Fetch Data
  async function initData() {
    try {
      const resDel = await fetch('/api/delivery');
      if (resDel.ok) setDeliveries(await resDel.json());

      const resSO = await fetch('/api/sales');
      if (resSO.ok) setSalesOrders(await resSO.json());
    } catch (e) { console.error(e); }
  }

  useEffect(() => { initData(); }, []);

  // Buat Delivery Baru
  const handleCreate = async () => {
    if (!selectedSO) return alert("Pilih Sales Order dulu!");
    
    try {
      const res = await fetch('/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sales_order_id: selectedSO })
      });

      // PERBAIKAN: Tangkap pesan error dari backend
      if (res.ok) {
        alert("Surat Jalan Berhasil Dibuat!");
        setIsModalOpen(false);
        setSelectedSO(''); 
        initData(); 
      } else {
        const err = await res.json();
        alert(`Gagal membuat surat jalan: ${err.error}`); // Tampilkan error asli
      }
    } catch (e) { console.error(e); }
  };

  // Kirim Barang (Shipped)
  const markShipped = async (id: number) => {
    if (!confirm("Konfirmasi pengiriman? Stok produk akan otomatis dipotong.")) return;
    
    try {
      const res = await fetch(`/api/delivery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Shipped' })
      });
      
      if (res.ok) {
        alert("Barang Terkirim! Stok Terpotong.");
        initData();
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.error}`);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-indigo-600"/> Pengiriman (Delivery)
        </h1>
        <button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow"
        >
          <Plus size={20}/> Buat Surat Jalan
        </button>
      </div>

      <div className="bg-white shadow-sm border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 font-semibold">
            <tr>
              <th className="p-4">No. Jalan</th>
              <th className="p-4">Ref. Order (SO)</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-gray-400">Belum ada pengiriman.</td></tr>
            ) : deliveries.map((d) => (
              <tr key={d.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-4 font-mono font-bold text-gray-700">{d.code}</td>
                <td className="p-4 text-indigo-600 font-medium">{d.so_code}</td>
                <td className="p-4">{d.customer_name}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    d.status === 'Shipped' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {d.status !== 'Shipped' ? (
                    <button 
                        onClick={() => markShipped(d.id)} 
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 flex items-center gap-1 ml-auto shadow-sm"
                    >
                      Kirim Barang <ArrowRight size={14}/>
                    </button>
                  ) : (
                    <span className="text-green-600 text-xs font-bold flex items-center justify-end gap-1">
                        <CheckCircle size={16}/> Terkirim
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative">
            <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
                <X size={20}/>
            </button>

            <h2 className="text-xl font-bold mb-6 text-gray-800">Pilih Sales Order</h2>
            
            <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Daftar Order Belum Dikirim</label>
                <select 
                    className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={selectedSO} 
                    onChange={e => setSelectedSO(e.target.value)}
                >
                <option value="">-- Pilih Order --</option>
                {salesOrders.map(s => (
                    <option key={s.id} value={s.id}>
                        {s.code} - {s.customer_name} ({formatRupiah(Number(s.total))})
                    </option>
                ))}
                </select>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Batal</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow">Buat Surat Jalan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}