'use client';

import { useEffect, useState } from 'react';
import { Plus, Save, Trash2, Layers, Eye, X } from 'lucide-react';

// --- TIPE DATA ---
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

interface BOM {
  id: number;
  name: string;
  product_name: string;
}

interface BOMItemRow {
  product_id: string;
  qty: string;
}

interface BOMDetail {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  qty: number;
  image_url: string;
}

export default function BOMPage() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [bomName, setBomName] = useState('');
  const [targetProduct, setTargetProduct] = useState('');
  const [rows, setRows] = useState<BOMItemRow[]>([{ product_id: '', qty: '' }]);

  // State untuk Modal Detail
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedBOMItems, setSelectedBOMItems] = useState<BOMDetail[]>([]);
  const [selectedBOMName, setSelectedBOMName] = useState('');

  // 1. Fetch Data Awal
  useEffect(() => {
    async function initData() {
      try {
        const [resBoms, resProds] = await Promise.all([
          fetch('/api/bom'),
          fetch('/api/products')
        ]);
        setBoms(await resBoms.json());
        setProducts(await resProds.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // --- PERBAIKAN UTAMA DI SINI ---
  // 2. Fungsi Lihat Detail (Dengan Pesan Error Jelas)
  const viewDetail = async (bom: BOM) => {
    try {
      console.log("Mencoba ambil ID:", bom.id);
      
      const res = await fetch(`/api/bom/${bom.id}`);
      
      // Jika API Error (Bukan 200 OK)
      if (!res.ok) {
        const text = await res.text(); // Baca pesan error asli dari server
        console.error("Error API:", text);
        alert(`Gagal Ambil Data! \n\nStatus: ${res.status} \nPenyebab: ${text}`); 
        return;
      }

      const data = await res.json();
      
      // Jika datanya kosong (Array kosong)
      if (data.length === 0) {
        alert("Resep ini tersimpan, tapi tidak memiliki bahan baku (Data Kosong).");
        // Tetap buka modal biar user lihat kalau kosong
      }
      
      setSelectedBOMItems(data);
      setSelectedBOMName(bom.name);
      setIsDetailOpen(true); // Buka Modal
    } catch (error: any) {
      console.error("Error Network:", error);
      alert(`Terjadi kesalahan jaringan/kodingan: ${error.message}`);
    }
  };

  // Helper Form Input Bahan
  const addRow = () => setRows([...rows, { product_id: '', qty: '' }]);
  
  const removeRow = (index: number) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const updateRow = (index: number, field: keyof BOMItemRow, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  // 3. Fungsi Simpan BOM Baru
  const handleSave = async () => {
    if (!targetProduct || !bomName) return alert('Nama Resep & Produk Wajib Diisi');
    
    const validItems = rows.filter(r => r.product_id && r.qty).map(r => ({
      product_id: Number(r.product_id),
      qty: Number(r.qty)
    }));

    if (validItems.length === 0) return alert('Minimal isi 1 bahan baku!');

    try {
      const res = await fetch('/api/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: bomName,
          product_id: Number(targetProduct),
          items: validItems
        })
      });

      if (res.ok) {
        alert('Resep Berhasil Disimpan!');
        setBomName('');
        setTargetProduct('');
        setRows([{ product_id: '', qty: '' }]);
        // Refresh data tabel
        const resBoms = await fetch('/api/bom');
        setBoms(await resBoms.json());
      } else {
        const errText = await res.text();
        alert(`Gagal menyimpan resep: ${errText}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Layers className="text-indigo-600"/> Bill of Materials (Resep)
      </h1>

      {/* --- FORM INPUT --- */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-700">Buat Resep Baru</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nama Resep</label>
            <input 
              type="text" 
              className="w-full border p-2 rounded-lg"
              placeholder="Contoh: Resep Burger Original"
              value={bomName}
              onChange={e => setBomName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Produk Jadi</label>
            <select 
              className="w-full border p-2 rounded-lg"
              value={targetProduct}
              onChange={e => setTargetProduct(e.target.value)}
            >
              <option value="">-- Pilih Menu --</option>
              {products.filter(p => p.category !== 'Bahan Baku').map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border mb-4">
          <label className="block text-sm font-bold mb-2 text-gray-700">Komposisi Bahan</label>
          {rows.map((row, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
              <select 
                className="flex-1 border p-2 rounded shadow-sm"
                value={row.product_id}
                onChange={e => updateRow(index, 'product_id', e.target.value)}
              >
                <option value="">-- Pilih Bahan --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                ))}
              </select>
              <input 
                type="number" 
                className="w-24 border p-2 rounded shadow-sm"
                placeholder="Qty"
                value={row.qty}
                onChange={e => updateRow(index, 'qty', e.target.value)}
              />
              <button onClick={() => removeRow(index)} className="text-red-400 p-2"><Trash2 size={18} /></button>
            </div>
          ))}
          <button onClick={addRow} className="mt-2 text-sm text-indigo-600 font-bold flex items-center gap-1">
            <Plus size={16}/> Tambah Baris
          </button>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
            <Save size={18}/> Simpan BOM
          </button>
        </div>
      </div>

      {/* --- LIST RESEP --- */}
      <div className="bg-white rounded-xl shadow overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Nama Resep</th>
              <th className="p-4">Produk Jadi</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {boms.map(bom => (
              <tr key={bom.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-bold text-indigo-700">{bom.name}</td>
                <td className="p-4">{bom.product_name}</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => viewDetail(bom)}
                    className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-md text-sm font-bold hover:bg-indigo-100 flex items-center gap-2 mx-auto"
                  >
                    <Eye size={16}/> Detail Bahan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL POPUP DETAIL --- */}
      {isDetailOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Rincian: {selectedBOMName}</h3>
              <button onClick={() => setIsDetailOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50 text-indigo-900">
                  <tr>
                    <th className="p-3 text-left">Bahan</th>
                    <th className="p-3 text-left">Kategori</th>
                    <th className="p-3 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedBOMItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium">{item.product_name}</td>
                      <td className="p-3 text-gray-500">{item.category}</td>
                      <td className="p-3 text-right font-bold">{item.qty}</td>
                    </tr>
                  ))}
                  {/* Handle jika kosong */}
                  {selectedBOMItems.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400">
                        Tidak ada bahan baku.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-50 text-right">
              <button onClick={() => setIsDetailOpen(false)} className="bg-gray-200 px-4 py-2 rounded font-bold hover:bg-gray-300">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}