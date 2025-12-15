"use client";
import { useState } from "react";
import Link from "next/link";

export default function VendorPage() {
  const [vendors, setVendors] = useState([
    { name: "Supplier Daging", phone: "0812345678", email: "daging@supplier.com" },
    { name: "Supplier Sayur", phone: "0819876543", email: "sayur@supplier.com" },
  ]);

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700">Vendor</h1>
        <Link
          href="/vendor/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          + Tambah Vendor
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow">
        <table className="w-full">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-3">Nama Vendor</th>
              <th className="p-3">Telepon</th>
              <th className="p-3">Email</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{v.name}</td>
                <td className="p-3">{v.phone}</td>
                <td className="p-3">{v.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
