'use client';

import { useEffect, useState } from 'react';
import { Truck, Plus, MapPin, Phone, Mail, X, Save, User } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  });

  // 1. Fetch Data Vendor
  async function fetchVendors() {
    try {
      const res = await fetch('/api/vendor');
      if (res.ok) {
        const data = await res.json();
        setVendors(data);
      }
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  }

  useEffect(() => { fetchVendors(); }, []);

  // 2. Submit Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert("Nama Vendor Wajib Diisi!");

    try {
      const res = await fetch('/api/vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Vendor Berhasil Disimpan!");
        setIsModalOpen(false);
        setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
        fetchVendors();
      } else {
        alert(`GAGAL: ${data.error}`);
      }
    } catch (e: any) {
      alert(`ERROR: ${e.message}`);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="text-indigo-600"/> Data Vendor (Supplier)
          </h1>
          <p className="text-sm text-slate-500">Kelola daftar pemasok bahan baku restoran.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm font-medium transition-colors"
        >
          <Plus size={18} /> Tambah Vendor
        </button>
      </div>

      {/* Grid Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p className="text-slate-500">Memuat data...</p> : vendors.length === 0 ? (
            <div className="col-span-3 text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                <Truck size={48} className="mx-auto text-slate-300 mb-3"/>
                <p className="text-slate-500 font-medium">Belum ada vendor terdaftar.</p>
            </div>
        ) : vendors.map((v) => (
          <div key={v.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-5 border-b border-slate-50 pb-4">
              <div className="bg-indigo-50 w-12 h-12 flex items-center justify-center rounded-lg text-indigo-600 font-bold text-lg">
                {v.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{v.name}</h3>
                <p className="text-xs text-slate-400 mt-1">ID: SUP-{v.id}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-400"/> 
                <span className="font-medium text-slate-700">{v.contact_person || '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-slate-400"/> 
                <span>{v.phone || '-'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-slate-400"/> 
                <span>{v.email || '-'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0"/> 
                <span className="leading-relaxed">{v.address || '-'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Tambah Vendor Baru</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Nama Perusahaan / Toko <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Contoh: PT Sayur Segar Jaya"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Contact Person (CP)</label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Pak Budi (Sales)"
                  value={formData.contact_person}
                  onChange={e => setFormData({...formData, contact_person: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">No. Telepon / WA</label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="08..."
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700">Email Kantor</label>
                  <input 
                    type="email" 
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="info@vendor.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Alamat Gudang / Kantor</label>
                <textarea 
                  className="w-full border border-slate-300 p-2.5 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Alamat lengkap vendor..."
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-indigo-700 mt-2 shadow-lg shadow-indigo-200 transition-all active:scale-95">
                <Save size={20}/> Simpan Data Vendor
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}