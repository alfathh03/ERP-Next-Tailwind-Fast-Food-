'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link'; // <--- INI TAMBAHAN PENTING
import { 
  TrendingUp, TrendingDown, ShoppingBag, AlertTriangle, 
  DollarSign, Package, ArrowRight, Activity, Calendar 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Helper Format Rupiah
  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { 
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
  }).format(n);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          setData(await res.json());
        } else {
          console.error("Gagal load dashboard API");
        }
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    }
    fetchDashboard();
  }, []);

  // Data Dummy untuk Grafik
  const chartData = [
    { name: 'Jan', income: 4000000, expense: 2400000 },
    { name: 'Feb', income: 3000000, expense: 1398000 },
    { name: 'Mar', income: 2000000, expense: 9800000 },
    { name: 'Apr', income: 5780000, expense: 3908000 },
    { name: 'Mei', income: 1890000, expense: 4800000 },
    { name: 'Jun', income: 6390000, expense: 3800000 },
  ];

  if (loading) return <div className="p-10 text-center text-gray-500">Memuat Dashboard...</div>;

  const profit = (data?.income || 0) - (data?.expense || 0);

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 mt-1">Ringkasan performa bisnis restoran Anda hari ini.</p>
        </div>
        <div className="bg-white border px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-medium text-slate-600">
          <Calendar size={16} className="text-indigo-500"/>
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* 2. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Income */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Pemasukan</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{fmt(data?.income || 0)}</h3>
        </div>

        {/* Expense */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-red-50 p-3 rounded-xl">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">+5.2%</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Pengeluaran (HPP)</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{fmt(data?.expense || 0)}</h3>
        </div>

        {/* Profit */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-indigo-50 p-3 rounded-xl">
              <DollarSign className="text-indigo-600" size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Laba Bersih</p>
          <h3 className={`text-2xl font-bold mt-1 ${profit >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
            {fmt(profit)}
          </h3>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-50 p-3 rounded-xl">
              <ShoppingBag className="text-orange-600" size={24} />
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Active</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Order Belum Selesai</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{data?.activeOrders || 0} Order</h3>
        </div>
      </div>

      {/* 3. CHARTS & ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-indigo-500"/> Analisis Cashflow
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="income" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" name="Pemasukan" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" name="Pengeluaran" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Stok */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500"/> Stok Menipis
            </h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold animate-pulse">Action Needed</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {data?.lowStock?.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Package size={40} className="mx-auto mb-2 opacity-20"/>
                <p>Semua stok aman terkendali.</p>
              </div>
            ) : (
              data?.lowStock?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-md border shadow-sm text-slate-700">
                      <Package size={18}/>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{item.name}</p>
                      <p className="text-xs text-slate-500">Sisa Stok: <span className="text-red-600 font-bold">{item.stock}</span></p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* --- TOMBOL INI SEKARANG BERFUNGSI --- */}
          <Link href="/products" className="block text-center w-full mt-4 py-3 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200">
            Lihat Inventory Lengkap
          </Link>
        </div>
      </div>

      {/* 4. TABLE TRANSAKSI */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
          <h3 className="font-bold text-slate-800 text-lg">Transaksi Terakhir</h3>
          <Link href="/sales" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
            Lihat Semua <ArrowRight size={16}/>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-5">Order ID</th>
                <th className="p-5">Customer</th>
                <th className="p-5">Tanggal</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Total Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.recentSales?.map((s: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5 font-mono text-sm text-slate-600 font-medium">{s.code}</td>
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{s.customer}</div>
                  </td>
                  <td className="p-5 text-sm text-slate-500">{new Date(s.order_date).toLocaleDateString()}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      s.status === 'Sent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-5 text-right font-bold text-slate-700">{fmt(Number(s.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}