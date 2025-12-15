'use client';

import { useEffect, useState } from 'react';
import { Plus, FileText, CheckCircle, ArrowRight, X } from 'lucide-react';

interface RFQ {
  id: number;
  code: string;
  vendor_name: string;
  vendor_id: number;
  status: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
}

interface Vendor {
  id: number;
  name: string;
}

interface RFQItemRow {
  product_id: string;
  qty: string;
}

export default function RFQPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [selectedVendor, setSelectedVendor] = useState('');
  const [rows, setRows] = useState<RFQItemRow[]>([{ product_id: '', qty: '' }]);

  // Init Data
  async function initData() {
    try {
      const [resRfq, resProd, resVend] = await Promise.all([
        fetch('/api/rfq'),
        fetch('/api/products'),
        fetch('/api/vendors')
      ]);
      setRfqs(await resRfq.json());
      setProducts(await resProd.json());
      setVendors(await resVend.json());
    } catch (e) { console.error(e); }
  }

  useEffect(() => { initData(); }, []);

  // Form Handlers
  const addRow = () => setRows([...rows, { product_id: '', qty: '' }]);
  const removeRow = (idx: number) => {
    const newRows = [...rows];
    newRows.splice(idx, 1);
    setRows(newRows);
  };
  const updateRow = (idx: number, field: keyof RFQItemRow, val: string) => {
    const newRows = [...rows];
    newRows[idx][field] = val;
    setRows(newRows);
  };

  // 1. Simpan RFQ
  const handleSave = async () => {
    if (!selectedVendor) return alert("Pilih Vendor");
    const validItems = rows.filter(r => r.product_id && r.qty).map(r => ({
      product_id: Number(r.product_id),
      qty: Number(r.qty)
    }));

    if (validItems.length === 0) return alert("Isi minimal 1 barang");

    await fetch('/api/rfq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor_id: Number(selectedVendor), items: validItems })
    });

    alert("RFQ Berhasil Dibuat");
    setIsModalOpen(false);
    setSelectedVendor('');
    setRows([{ product_id: '', qty: '' }]);
    initData();
  };

  // 2. FITUR PINTAR: Convert RFQ ke PO
  const convertToPO = async (rfq: RFQ) => {
    if (!confirm("Yakin ingin mengubah RFQ ini menjadi Pembelian (PO)?")) return;

    try {
      // A. Ambil Detail Item RFQ dari Backend
      const resItems = await fetch(`/api/rfq/${rfq.id}`);
      const items = await resItems.json();

      if (items.length === 0) return alert("RFQ Kosong!");

      // B. Siapkan Data untuk API Purchase
      // Kita set harga beli (cost) sementara pakai 0 dulu atau estimasi, nanti diedit di PO
      const poItems = items.map((item: any) => ({
        product_id: item.product_id,
        qty: item.qty,
        cost: item.est_price || 0 // Default harga
      }));

      // C. Kirim ke API Purchase
      const resPO = await fetch('/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: rfq.vendor_id,
          items: poItems,
          total: 0, // Nanti dihitung ulang di Purchase
          status: 'Draft' // Masuk sebagai Draft dulu biar aman
        })
      });

      if (resPO.ok) {
        // D. Update Status RFQ jadi 'Converted'
        await fetch(`/api/rfq/${rfq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Converted' })
        });

        alert("Berhasil! RFQ telah menjadi Purchase Order (Status: Draft). Silakan cek menu Purchase.");
        initData();
      } else {
        alert("Gagal membuat PO.");
      }

    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600"/> Request for Quotation (RFQ)
        </h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-indigo-700">
          <Plus size={20} /> Buat Penawaran
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Kode RFQ</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-gray-500">{r.code}</td>
                <td className="p-4 font-bold text-indigo-700">{r.vendor_name}</td>
                <td className="p-4 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    r.status === 'Converted' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {r.status !== 'Converted' && (
                    <button 
                      onClick={() => convertToPO(r)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1 ml-auto"
                    >
                      Jadikan PO <ArrowRight size={14}/>
                    </button>
                  )}
                  {r.status === 'Converted' && (
                    <span className="text-green-600 text-xs font-bold flex items-center justify-end gap-1">
                      <CheckCircle size={14}/> Sudah di-PO
                    </span>
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
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Buat Permintaan Harga (RFQ)</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">Pilih Vendor</label>
              <select className="w-full border p-2 rounded" value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
                <option value="">-- Pilih Vendor --</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>

            <div className="bg-gray-50 p-3 rounded mb-4 max-h-[40vh] overflow-y-auto">
              {rows.map((row, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <select className="flex-1 border p-1 rounded text-sm" value={row.product_id} onChange={e => updateRow(idx, 'product_id', e.target.value)}>
                    <option value="">-- Barang --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" className="w-20 border p-1 rounded text-sm" placeholder="Qty" value={row.qty} onChange={e => updateRow(idx, 'qty', e.target.value)}/>
                  <button onClick={() => removeRow(idx)} className="text-red-500"><X size={16}/></button>
                </div>
              ))}
              <button onClick={addRow} className="text-xs text-indigo-600 font-bold">+ Tambah Baris</button>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500">Batal</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded font-bold">Simpan RFQ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}