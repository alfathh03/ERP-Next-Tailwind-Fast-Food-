"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewVendor() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const saveVendor = (e: any) => {
    e.preventDefault();
    alert("Vendor berhasil disimpan!");
    router.push("/vendor");
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-semibold text-indigo-700 mb-6">Tambah Vendor</h1>

      <form className="space-y-5" onSubmit={saveVendor}>
        <input
          placeholder="Nama Vendor"
          className="border p-3 rounded-lg w-full"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Telepon"
          className="border p-3 rounded-lg w-full"
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <input
          placeholder="Email"
          className="border p-3 rounded-lg w-full"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <button className="px-5 py-3 bg-indigo-600 text-white rounded-lg">
          Simpan
        </button>
      </form>
    </div>
  );
}
