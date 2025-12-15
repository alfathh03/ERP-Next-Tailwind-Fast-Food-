'use client';

import { useEffect, useState } from 'react';
import { Plus, ShoppingCart, Trash2, Save, X } from 'lucide-react';

// Tipe Data
interface Sale {
  id: number;
  code: string;
  customer_name: string;
  total: number;
  status: string;
  order_date: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Customer {
  id: number;
  name: string;
}

interface CartItem {
  product_id: number;
  product_name: string;
  price: number;
  qty: number;
  subtotal: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCust, setSelectedCust] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Input Item Sementara
  const [tempProduct, setTempProduct] = useState('');
  const [tempQty, setTempQty] = useState(1);

  // 1. Fetch Data Awal (Sales, Produk, Customer)
  useEffect(() => {
    async function initData() {
      try {
        const [resSales, resProd] = await Promise.all([
          fetch('/api/sales'),
          fetch('/api/products')
        ]);
        
        setSales(await resSales.json());
        setProducts(await resProd.json());
        
        // Dummy Customer (Kalau belum ada API Customer, pakai ini dulu)
        // Nanti bisa diganti fetch('/api/customer')
        setCustomers([
          { id: 1, name: 'Pelanggan Umum' },
          { id: 2, name: 'Gojek / Grab' },
          { id: 3, name: 'VIP Member' }
        ]);
        
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // 2. Tambah Item ke Keranjang
  const addToCart = () => {
    const prodId = Number(tempProduct);
    const product = products.find(p => p.id === prodId);
    
    if (!product) return alert("Pilih produk dulu!");
    if (tempQty <= 0) return alert("Jumlah minimal 1");

    const newItem: CartItem = {
      product_id: product.id,
      product_name: product.name,
      price: Number(product.price),
      qty: tempQty,
      subtotal: Number(product.price) * tempQty
    };

    setCart([...cart, newItem]);
    setTempProduct(''); // Reset pilihan
    setTempQty(1);
  };

  // 3. Hapus Item dari Keranjang
  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // 4. Hitung Grand Total
  const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // 5. Simpan Transaksi ke Database
  const handleSave = async () => {
    if (!selectedCust || cart.length === 0) return alert("Data belum lengkap!");

    try {
      const payload = {
        customer_id: Number(selectedCust),
        items: cart,
        total: grandTotal,
        status: 'Sales Order' // Default status
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Transaksi Berhasil!");
        setIsModalOpen(false);
        setCart([]);
        setSelectedCust('');
        // Refresh Data Penjualan
        const resSales = await fetch('/api/sales');
        setSales(await resSales.json());
      } else {
        alert("Gagal menyimpan transaksi");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Format Rupiah
  const fmt = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales Orders</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex gap-2 hover:bg-indigo-700">
          <Plus size={20} /> Buat Pesanan Baru
        </button>
      </div>

      {/* Tabel List Sales */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-indigo-50 text-indigo-900 font-semibold">
            <tr>
              <th className="p-4">Kode Order</th>
              <th className="p-4">Pelanggan</th>
              <th className="p-4">Tanggal</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : sales.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-indigo-600">{s.code}</td>
                <td className="p-4">{s.customer_name || 'Umum'}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(s.order_date).toLocaleDateString()}</td>
                <td className="p-4 font-bold">{fmt(s.total)}</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL INPUT POS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart /> Input Pesanan</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Kiri: Form Input */}
              <div className="md:col-span-1 space-y-4 border-r pr-0 md:pr-6">
                <div>
                  <label className="block text-sm font-bold mb-1">Pilih Pelanggan</label>
                  <select className="w-full border p-2 rounded" value={selectedCust} onChange={e => setSelectedCust(e.target.value)}>
                    <option value="">-- Pilih --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <hr className="my-4"/>

                <div>
                  <label className="block text-sm font-bold mb-1">Tambah Menu</label>
                  <select className="w-full border p-2 rounded mb-2" value={tempProduct} onChange={e => setTempProduct(e.target.value)}>
                    <option value="">-- Pilih Menu --</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} - {fmt(Number(p.price))}</option>)}
                  </select>
                  
                  <div className="flex gap-2">
                    <input type="number" className="w-20 border p-2 rounded" value={tempQty} onChange={e => setTempQty(Number(e.target.value))} min={1} />
                    <button onClick={addToCart} className="flex-1 bg-indigo-100 text-indigo-700 font-bold rounded hover:bg-indigo-200">
                      + Tambah
                    </button>
                  </div>
                </div>
              </div>

              {/* Kanan: Keranjang Belanja */}
              <div className="md:col-span-2 flex flex-col">
                <h3 className="font-bold mb-2 text-gray-700">Rincian Pesanan</h3>
                <div className="flex-1 border rounded-lg overflow-y-auto min-h-[200px] bg-gray-50 p-2">
                  {cart.length === 0 ? (
                    <p className="text-center text-gray-400 mt-10">Keranjang masih kosong</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="text-left text-gray-500 border-b">
                        <tr>
                          <th className="pb-2">Menu</th>
                          <th className="pb-2 text-center">Qty</th>
                          <th className="pb-2 text-right">Subtotal</th>
                          <th className="pb-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, idx) => (
                          <tr key={idx} className="border-b last:border-0">
                            <td className="py-2">{item.product_name}</td>
                            <td className="py-2 text-center">{item.qty}</td>
                            <td className="py-2 text-right">{fmt(item.subtotal)}</td>
                            <td className="py-2 text-right">
                              <button onClick={() => removeFromCart(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Footer Total */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center bg-yellow-50 p-4 rounded-lg">
                  <span className="text-lg font-bold text-gray-600">Total Tagihan:</span>
                  <span className="text-2xl font-bold text-indigo-700">{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
               <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded">Batal</button>
               <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded flex items-center gap-2 hover:bg-indigo-700 shadow-lg">
                 <Save size={18} /> Simpan Transaksi
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}                