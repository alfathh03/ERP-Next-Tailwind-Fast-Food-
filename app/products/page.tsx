'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, X, Save } from 'lucide-react';

// Definisi Tipe Data Produk
interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  image_url: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // State Form (Angka menggunakan string kosong agar input bersih)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Makanan',
    price: '',  // Awalnya kosong
    cost: '',   // Awalnya kosong
    stock: '',  // Awalnya kosong
    image_url: ''
  });

  // Fetch Data dari Database
  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Gagal ambil data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi Simpan ke Database
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Ubah string kosong menjadi angka sebelum dikirim ke API
      const payload = {
        ...formData,
        price: Number(formData.price),
        cost: Number(formData.cost),
        stock: Number(formData.stock),
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Produk Berhasil Disimpan!');
        setIsModalOpen(false);
        // Reset Form
        setFormData({ name: '', sku: '', category: 'Makanan', price: '', cost: '', stock: '', image_url: '' });
        fetchProducts(); // Refresh data
      } else {
        alert('Gagal simpan data.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Menu</h1>
          <p className="text-sm text-gray-500">Kelola daftar makanan dan minuman</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
        >
          <Plus size={18} /> Tambah Menu Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        <input 
          className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
          placeholder="Cari nama menu..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid Produk */}
      {loading ? (
        <div className="text-center py-10">Loading data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
              {/* Gambar Produk */}
              <div className="h-48 overflow-hidden bg-gray-100 relative group">
                <img 
                  // Gunakan Link langsung, jika kosong pakai placeholder online
                  src={p.image_url || 'https://placehold.co/400?text=No+Image'} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  // Jika link rusak, ganti otomatis ke placeholder online
                  onError={(e) => {e.currentTarget.src = 'https://placehold.co/400?text=Error'}} 
                />
                <span className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-xs font-bold rounded shadow text-gray-700">
                  {p.category}
                </span>
              </div>

              {/* Info Produk */}
              <div className="p-4">
                <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{p.name}</h3>
                <p className="text-xs text-gray-500 mb-3 font-mono">SKU: {p.sku}</p>
                <div className="flex justify-between items-center border-t pt-3 mt-2">
                  <span className="font-bold text-indigo-700 text-lg">{formatRupiah(Number(p.price))}</span>
                  <span className={`text-xs px-2 py-1 rounded font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Stok: {p.stock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-100 p-1 rounded-full"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2">Form Tambah Menu</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Makanan/Minuman</label>
                <input 
                  type="text" required
                  className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Contoh: Nasi Goreng Spesial"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Unik (SKU)</label>
                  <input 
                    type="text" required
                    className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="NASGOR-01"
                    value={formData.sku} 
                    onChange={e => setFormData({...formData, sku: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                  <select 
                    className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Makanan">Makanan</option>
                    <option value="Minuman">Minuman</option>
                    <option value="Snack">Snack</option>
                    <option value="Bahan Baku">Bahan Baku</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Jual (Rp)</label>
                  <input 
                    type="number" required
                    className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Contoh: 25000"
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Modal/HPP (Rp)</label>
                  <input 
                    type="number" required
                    className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Contoh: 15000"
                    value={formData.cost} 
                    onChange={e => setFormData({...formData, cost: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stok Awal</label>
                <input 
                  type="number" required
                  className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="Contoh: 100"
                  value={formData.stock} 
                  onChange={e => setFormData({...formData, stock: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link Gambar (URL)</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" 
                  placeholder="https://..."
                  value={formData.image_url} 
                  onChange={e => setFormData({...formData, image_url: e.target.value})} 
                />
                <p className="text-xs text-gray-500 mt-1"></p>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2 mt-4 shadow-md"
              >
                <Save size={20}/> Simpan Menu
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}