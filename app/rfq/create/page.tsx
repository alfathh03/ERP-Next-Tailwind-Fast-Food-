// app/rfq/create/page.tsx
"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

export default function CreateRFQPage() {
  const [items, setItems] = useState([{ product: "", qty: 1 }]);

  const addItem = () => {
    setItems([...items, { product: "", qty: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-indigo-700 mb-8">Buat RFQ Baru</h1>

      <div className="bg-white p-6 rounded-2xl shadow max-w-3xl">

        {/* Vendor */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-1">Pilih Vendor</label>
          <select className="w-full border rounded-xl px-3 py-2">
            <option>PT Segar Abadi</option>
            <option>CV Bumi Makmur</option>
          </select>
        </div>

        {/* Item List */}
        <h2 className="text-lg font-semibold mb-3">Item RFQ</h2>

        {items.map((item, i) => (
          <div key={i} className="flex gap-3 mb-3">
            <input
              placeholder="Nama Produk"
              className="w-full border rounded-xl px-3 py-2"
            />
            <input
              type="number"
              min="1"
              className="w-24 border rounded-xl px-3 py-2"
              defaultValue={1}
            />
            <button
              onClick={() => removeItem(i)}
              className="bg-red-500 text-white p-2 rounded-xl"
            >
              <Trash className="w-5 h-5" />
            </button>
          </div>
        ))}

        <button
          onClick={addItem}
          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-xl"
        >
          <Plus className="w-5 h-5" /> Tambah Item
        </button>

        {/* Buttons */}
        <div className="flex justify-end mt-8 gap-3">
          <button className="px-4 py-2 rounded-xl bg-gray-200">Batal</button>
          <button className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
            Simpan RFQ
          </button>
        </div>
      </div>
    </div>
  );
}
