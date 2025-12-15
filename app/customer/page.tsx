'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, MapPin, Phone, Mail, X, Save } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  // 1. Fetch Data dari API
  async function fetchCustomers() {
    try {
      const res = await fetch('/api/customer');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        console.error("Gagal ambil data customer");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2. Fungsi Simpan Data (Dengan Error Checking Lengkap)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi Frontend
    if (!formData.name) return alert("Nama Pelanggan Wajib Diisi!");

    try {
      const res = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json(); // Baca respon server

      if (res.ok) {
        // JIKA SUKSES
        alert("BERHASIL: Data Pelanggan Disimpan!");
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', address: '' }); // Reset form
        fetchCustomers(); // Refresh data di layar
      } else {
        // JIKA GAGAL (Tampilkan pesan error asli dari backend)
        alert(`GAGAL MENYIMPAN: ${data.error}`);
      }

    } catch (e: any) {
      // JIKA ERROR KONEKSI / SYSTEM
      console.error(e);
      alert(`ERROR SISTEM: ${e.message}`);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-indigo-600"/> Data Pelanggan (Customer)
          </h1>
          <p className="text-sm text-gray-500">Kelola database pelanggan resto kamu.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow"
        >
          <Plus size={18} /> Tambah Pelanggan
        </button>
      </div>

      {/* Grid Card Customer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p>Loading data...</p> : customers.length === 0 ? (
            <div className="col-span-3 text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-400">Belum ada data pelanggan.</p>
            </div>
        ) : customers.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-100 w-12 h-12 flex items-center justify-center rounded-full text-indigo-600 font-bold text-xl">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{c.name}</h3>
                <p className="text-xs text-gray-400">ID: #{c.id}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400"/> 
                <span>{c.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400"/> 
                <span>{c.email || '-'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-gray-400 mt-0.5"/> 
                <span className="flex-1 leading-tight">{c.address || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl relative">
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6 border-b pb-2 text-gray-800">Tambah Pelanggan Baru</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">No. HP / WA</label>
                  <input 
                    type="text" 
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1 text-gray-700">Email</label>
                  <input 
                    type="email" 
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="mail@contoh.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Alamat Lengkap</label>
                <textarea 
                  className="w-full border p-2.5 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Nama jalan, nomor rumah, kota..."
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 mt-4 shadow transition-colors">
                <Save size={18}/> Simpan Data
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}