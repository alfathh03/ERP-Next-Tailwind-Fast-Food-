'use client';

import { useEffect, useState } from 'react';
import { Plus, ShoppingCart, Trash2, Save, X, Truck, Pencil } from 'lucide-react';

interface Purchase {
  id: number;
  code: string;
  vendor_name: string;
  vendor_id: number;
  total: number;
  status: string;
  date: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
}

interface Vendor {
  id: number;
  name: string;
}

interface CartItem {
  product_id: number;
  product_name: string;
  cost: number;
  qty: number;
  subtotal: number;
}

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editId, setEditId] = useState<number | null>(null); // ID untuk Mode Edit
  const [selectedVendor, setSelectedVendor] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState('Draft');

  // Input Item Sementara
  const [tempProduct, setTempProduct] = useState('');
  const [tempCost, setTempCost] = useState('');
  const [tempQty, setTempQty] = useState('');

  // 1. Fetch Data Awal
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [resPurchases, resProds, resVendors] = await Promise.all([
        fetch('/api/purchase'),
        fetch('/api/products'),
        fetch('/api/vendors')
      ]);
      setPurchases(await resPurchases.json());
      setProducts(await resProds.json());
      setVendors(await resVendors.json());
      setLoading(false);
    } catch (error) { console.error(error); }
  }

  // 2. Fungsi Buka Modal Baru
  const openNewModal = () => {
    setEditId(null); // Mode Baru
    setSelectedVendor('');
    setCart([]);
    setStatus('Received'); // Default kalau baru langsung terima aja
    setIsModalOpen(true);
  };

  // 3. Fungsi Buka Modal Edit
  const handleEdit = async (po: Purchase) => {
    if (po.status === 'Received') return alert("PO yang sudah diterima tidak bisa diedit lagi.");

    setEditId(po.id); // Mode Edit
    setSelectedVendor(String(po.vendor_id));
    setStatus(po.status);
    
    // Ambil Detail Item dari Backend
    const res = await fetch(`/api/purchase/${po.id}`);
    const items = await res.json();
    
    // Masukkan ke Cart form
    const formattedCart = items.map((item: any) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      cost: Number(item.cost),
      qty: Number(item.qty),
      subtotal: Number(item.cost) * Number(item.qty)
    }));
    setCart(formattedCart);

    setIsModalOpen(true);
  };

  // 4. Tambah Item ke Cart
  const addToCart = () => {
    const prodId = Number(tempProduct);
    const product = products.find(p => p.id === prodId);
    if (!product || !tempCost || !tempQty) return alert("Lengkapi data item!");

    const newItem: CartItem = {
      product_id: product.id,
      product_name: product.name,
      cost: Number(tempCost),
      qty: Number(tempQty),
      subtotal: Number(tempCost) * Number(tempQty)
    };

    setCart([...cart, newItem]);
    setTempProduct(''); setTempCost(''); setTempQty('');
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // 5. Simpan (Bisa POST atau PUT)
  const handleSave = async () => {
    if (!selectedVendor || cart.length === 0) return alert("Data tidak lengkap!");

    const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const payload = {
      vendor_id: Number(selectedVendor),
      items: cart,
      total: grandTotal,
      status: status
    };

    try {
      let res;
      if (editId) {
        // --- MODE EDIT (PUT) ---
        res = await fetch(`/api/purchase/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // --- MODE BARU (POST) ---
        res = await fetch('/api/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        alert(editId ? "PO Berhasil Diupdate!" : "PO Berhasil Dibuat!");
        setIsModalOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        alert("Gagal: " + err.message);
      }
    } catch (e) { console.error(e); }
  };

  const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-indigo-600"/> Pembelian (Purchase)
        </h1>
        <button onClick={openNewModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-indigo-700">
          <Plus size={20} /> Buat PO Baru
        </button>
      </div>

      {/* Tabel List Purchase */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4">Kode PO</th>
              <th className="p-4">Vendor</th>
              <th className="p-4">Status</th>
              <th className="p-4">Total</th>
              <th className="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : purchases.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-indigo-600">{p.code}</td>
                <td className="p-4">{p.vendor_name}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {p.status}
                    </span>
                </td>
                <td className="p-4 font-bold">{formatRupiah(Number(p.total))}</td>
                <td className="p-4 text-right">
                  {/* Tombol Edit hanya muncul jika status belum Received */}
                  {p.status !== 'Received' && (
                    <button 
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded hover:bg-yellow-100 border border-yellow-200 flex items-center gap-1 ml-auto"
                    >
                      <Pencil size={14}/> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT PO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart /> {editId ? 'Edit PO' : 'Buat Pembelian Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Kiri: Form Input */}
              <div className="md:col-span-1 space-y-4 border-r pr-0 md:pr-6">
                <div>
                  <label className="block text-sm font-bold mb-1">Pilih Vendor</label>
                  <select className="w-full border p-2 rounded" value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)}>
                    <option value="">-- Pilih Vendor --</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Status Barang</label>
                  <select className="w-full border p-2 rounded bg-yellow-50 font-semibold" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="Draft">Draft (Masih Nego)</option>
                    <option value="Ordered">Ordered (Sudah Pesan)</option>
                    <option value="Received">Received (Barang Datang)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">*Pilih <b>Received</b> untuk menambah stok otomatis.</p>
                </div>

                <hr className="my-4"/>

                <div>
                  <label className="block text-sm font-bold mb-1">Tambah Produk</label>
                  <select className="w-full border p-2 rounded mb-2" value={tempProduct} onChange={e => setTempProduct(e.target.value)}>
                    <option value="">-- Pilih Produk --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="number" placeholder="Harga Beli" className="border p-2 rounded" value={tempCost} onChange={e => setTempCost(e.target.value)} />
                    <input type="number" placeholder="Qty" className="border p-2 rounded" value={tempQty} onChange={e => setTempQty(e.target.value)} />
                  </div>

                  <button onClick={addToCart} className="w-full bg-indigo-100 text-indigo-700 font-bold rounded hover:bg-indigo-200 py-2">
                    + Tambah Item
                  </button>
                </div>
              </div>

              {/* Kanan: Keranjang */}
              <div className="md:col-span-2 flex flex-col">
                <h3 className="font-bold mb-2 text-gray-700">Daftar Barang</h3>
                <div className="flex-1 border rounded-lg overflow-y-auto min-h-[200px] bg-gray-50 p-2">
                    <table className="w-full text-sm">
                      <thead className="text-left text-gray-500 border-b">
                        <tr>
                          <th className="pb-2">Produk</th>
                          <th className="pb-2 text-right">Harga</th>
                          <th className="pb-2 text-center">Qty</th>
                          <th className="pb-2 text-right">Subtotal</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2">{item.product_name}</td>
                            <td className="py-2 text-right">
                              {/* Input Harga di Tabel biar gampang edit harga nego */}
                              {formatRupiah(item.cost)}
                            </td>
                            <td className="py-2 text-center">{item.qty}</td>
                            <td className="py-2 text-right font-bold">{formatRupiah(item.subtotal)}</td>
                            <td className="py-2 text-right">
                              <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
                
                <div className="mt-4 pt-4 border-t flex justify-between items-center bg-green-50 p-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-600">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-700">
                    {formatRupiah(cart.reduce((sum, item) => sum + item.subtotal, 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded">Batal</button>
               <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded flex items-center gap-2 hover:bg-indigo-700 shadow-lg">
                 <Save size={18} /> {editId ? 'Simpan Perubahan' : 'Buat PO'}
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}