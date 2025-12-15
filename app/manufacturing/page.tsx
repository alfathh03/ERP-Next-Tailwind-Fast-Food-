'use client';

import { useEffect, useState } from 'react';
import { Plus, Factory, CheckCircle, Clock } from 'lucide-react';

interface MO {
  id: number;
  code: string;
  product_name: string;
  qty_to_produce: number;
  status: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
}

export default function ManufacturingPage() {
  const [mos, setMos] = useState<MO[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState('');

  // 1. Fetch Data
  async function fetchData() {
    try {
      const [resMO, resProd] = await Promise.all([
        fetch('/api/manufacturing'),
        fetch('/api/products')
      ]);
      setMos(await resMO.json());
      setProducts(await resProd.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Buat MO Baru
  const handleCreate = async () => {
    if (!selectedProduct || !qty) return alert("Isi data dulu!");

    try {
      const res = await fetch('/api/manufacturing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: Number(selectedProduct),
          qty: Number(qty)
        })
      });

      if (res.ok) {
        alert("Manufacturing Order Dibuat!");
        setIsModalOpen(false);
        setQty('');
        setSelectedProduct('');
        fetchData();
      } else {
        alert("Gagal membuat MO");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Proses Selesai (Mark as Done)
  const handleMarkDone = async (id: number) => {
    if (!confirm("Apakah proses produksi sudah selesai? Stok bahan akan dipotong.")) return;

    try {
      const res = await fetch(`/api/manufacturing/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Done' })
      });

      if (res.ok) {
        alert("Sukses! Stok Barang Jadi bertambah, Bahan Baku berkurang.");
        fetchData();
      } else {
        const err = await res.json();
        alert(`Gagal: ${err.error}`); // Tampilkan pesan error jika BOM tidak ada
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Factory className="text-indigo-600"/> Manufacturing Orders
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-indigo-700">
          <Plus size={20} /> Buat Order Produksi
        </button>
      </div>

      {/* Tabel List MO */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Kode MO</th>
              <th className="p-4">Produk</th>
              <th className="p-4 text-center">Jumlah</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : mos.map((mo) => (
              <tr key={mo.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-gray-500">{mo.code}</td>
                <td className="p-4 font-bold text-indigo-700">{mo.product_name}</td>
                <td className="p-4 text-center font-bold">{mo.qty_to_produce}</td>
                <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        mo.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                        {mo.status}
                    </span>
                </td>
                <td className="p-4 text-right">
                    {mo.status !== 'Done' && (
                        <button 
                            onClick={() => handleMarkDone(mo.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 ml-auto"
                        >
                            <CheckCircle size={16}/> Selesaikan
                        </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Buat Order Produksi</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Produk yang akan dimasak</label>
                    <select className="w-full border p-2 rounded" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
                        <option value="">-- Pilih Menu --</option>
                        {products.filter(p => p.category !== 'Bahan Baku').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">*Pastikan produk ini sudah punya Resep (BOM)</p>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Jumlah Produksi</label>
                    <input 
                        type="number" 
                        className="w-full border p-2 rounded" 
                        placeholder="Contoh: 10" 
                        value={qty} 
                        onChange={e => setQty(e.target.value)}
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Batal</button>
                <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700">Simpan Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}